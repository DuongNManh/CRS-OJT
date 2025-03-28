import React, { useState } from "react";
import { useAppSelector } from "@/services/store/store";
import { staffService } from "@/services/features/staff.service";
import { toast } from "react-toastify";

function UserDetail() {
  const user = useAppSelector((state) => state.auth.user);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null,
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("avatarFile", selectedImage);

      try {
        const updatedUser = await staffService.uploadImageAvatar(formData);
        setAvatarPreview(updatedUser.avatarUrl);
        if (user) {
          toast.success("Avatar uploaded successfully");
        }
      } catch (error) {
        toast.error("Error uploading avatar");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4">User Details</h2>
          {user ? (
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="text-xl font-semibold">Welcome, {user.name}!</h3>
                <p className="text-gray-600">
                  Email: <span className="font-medium">{user.email}</span>
                </p>
                <p className="text-gray-600">
                  Role: <span className="font-medium">{user.systemRole}</span>
                </p>
                <p className="text-gray-600">
                  Department:{" "}
                  <span className="font-medium">{user.department}</span>
                </p>
              </div>

              {/* Avatar Preview and Upload */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold">Avatar</h4>
                <div className="mt-2 flex justify-center items-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="w-32 h-32 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-300 rounded-full" />
                  )}
                </div>

                <div className="flex justify-center mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="p-2 border border-gray-300 rounded"
                  />
                </div>
                <button
                  onClick={handleImageUpload}
                  className="mt-2 w-full bg-blue-500 text-white py-2 rounded"
                >
                  Upload Avatar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No user information available.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
export default UserDetail;
