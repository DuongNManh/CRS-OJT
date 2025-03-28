import React, { useState, useEffect } from "react";
import { staffService } from "@/services/features/staff.service";
import { toast } from "react-toastify";
import { ProfileResponse } from '@/interfaces/staff.interface';
import { FaUserCircle } from 'react-icons/fa';
import CommonLayout from "@/layouts/CommonLayout";
import { useApi } from "@/hooks/useApi";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { setUser } from "@/services/store/authSlice";
import { IAuthUser, SystemRole } from "@/interfaces/auth.interface";
import Card from "antd/es/card/Card";

function UserDetail() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const {withLoading} = useApi();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const response = await withLoading(staffService.profile());
        if (response.is_success && response.data) {
          setProfile(response.data);
          setAvatarPreview(response.data.avatarUrl);
        }
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading user info...</div>
      </div>
    );
  }

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("avatarFile", selectedImage);

      try {
        const updatedUser = await withLoading(staffService.uploadImageAvatar(formData));
        setAvatarPreview(updatedUser.avatarUrl);
        if (profile) {
          if (profile && updatedUser.id) {
            const updatedUserData: ProfileResponse = { 
              ...profile, 
              avatarUrl: updatedUser.avatarUrl, 
            };
            setProfile(updatedUserData);
            const updatedUserRedux: IAuthUser = { 
              id: user!.id, // Ensure id is included
              email: profile.email || '', // Provide a default value
              name: profile.name || '', // Provide a default value
              systemRole: profile.systemRole  || SystemRole.STAFF, // Provide a default value
              department: profile.department || '', // Provide a default value
              avatarUrl: updatedUser.avatarUrl,
            };
            dispatch(setUser(updatedUserRedux));
          }

          toast.success("Avatar uploaded successfully");
        }
        setIsModalOpen(false); // Close modal after upload
      } catch (error) {
        toast.error("Error uploading avatar");
      }
    }
  };

  return (
    <CommonLayout>
      {profile ? (
        <div className="space-y-6 mx-auto dark:text-white"> 
          <div className="min-h-[300px] relative bg-white shadow-md rounded-lg overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="/bg.jpg" alt="Background" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center space-x-4 p-6 relative z-10 h-full" onClick={() => setIsModalOpen(true)}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-48 h-48 object-cover rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <FaUserCircle className="w-48 h-48 text-gray-300" />
              )}
              <div className="text-white">
                <h3 className="text-3xl font-bold">{profile?.name}</h3>
                <p className="text-sm">Email: <span className="font-medium">{profile?.email}</span></p>
                <p className="text-sm">Role: <span className="font-medium">{profile?.systemRole}</span></p>
                <p className="text-sm">Department: <span className="font-medium">{profile?.department}</span></p>
              </div>
            </div>
          </div>

          {/* Modal for Image Upload */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h4 className="text-lg font-semibold">Change Avatar</h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-4 p-2 border border-gray-300 rounded w-full"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleImageUpload}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="ml-2 bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <Card title="Participated Projects" className="p-4">
          <div className="border-t pt-4 space-y-4">
            <div className="text-gray-600 pl-4">
              {profile?.project && profile.project.length > 0 ? (
                profile.project.map((project) => (
                  <div key={project.id} className="bg-white p-4 rounded-md mb-2 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <p className="font-medium text-gray-900">{project.name || 'Unnamed Project'}</p>
                    <p className="text-sm text-gray-500">Status: <span className="font-medium">{project.status}</span></p>
                    <p className="text-sm text-gray-500">Budget: <span className="font-medium">${project.budget.toLocaleString()}</span></p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No projects available.</p>
              )}
            </div>
          </div>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-500">No user information available.</p>
      )}
    </CommonLayout>
  );
}

export default UserDetail;