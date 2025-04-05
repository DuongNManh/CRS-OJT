// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useState, useEffect } from "react";
import { staffService } from "@/services/features/staff.service";
import { toast } from "react-toastify";
import { ProfileResponse } from "@/interfaces/staff.interface";
import {
  FaBriefcase,
  FaBuilding,
  FaEnvelope,
  FaUserCircle,
  FaUserTag,
} from "react-icons/fa";
import CommonLayout from "@/layouts/CommonLayout";
import { useApi } from "@/hooks/useApi";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { setUser } from "@/services/store/authSlice";
import { IAuthUser, SystemRole } from "@/interfaces/auth.interface";
import { addSpaceBeforeCapitalLetters } from "@/utils/stringFormatter";
import { useTranslation } from "react-i18next";

function UserDetail() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const { withLoading } = useApi();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
        toast.error(t("user_detail.error_fetch_profile"));
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
      <div className="flex min-h-screen items-center justify-center dark:text-white dark:bg-[#121212]">
        <div className="text-lg">{t("user_detail.loading_user_info")}</div>
      </div>
    );
  }

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("avatarFile", selectedImage);

      try {
        const updatedUser = await withLoading(
          staffService.uploadImageAvatar(formData),
        );
        setAvatarPreview(updatedUser.avatarUrl);
        if (profile) {
          if (profile && updatedUser.id) {
            const updatedUserData: ProfileResponse = {
              ...profile,
              avatarUrl: updatedUser.avatarUrl,
            };
            setProfile(updatedUserData);
            const updatedUserRedux: IAuthUser = {
              id: user!.id,
              email: profile.email || "",
              name: profile.name || "",
              systemRole: profile.systemRole || SystemRole.STAFF,
              department: profile.department || "",
              avatarUrl: updatedUser.avatarUrl,
            };
            dispatch(setUser(updatedUserRedux));
          }

          toast.success(t("user_detail.avatar_upload_success"));
        }
        setIsModalOpen(false); // Close modal after upload
      } catch (error) {
        toast.error(t("user_detail.avatar_upload_error"));
      }
    }
  };

  return (
    <CommonLayout>
      {profile ? (
        <div className="min-h-screen dark:bg-[#18191A]">
          {/* Cover Photo Section */}
          <div className="relative h-[350px] bg-gradient-to-b from-gray-800 to-gray-600">
            <img
              src="/bg.jpg"
              alt=""
              className="absolute w-full h-full bg-cover"
            />

            {/* Profile Info Container */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-20 bg-gradient-to-t from-black/60 to-transparent">
              <div className="max-w-7xl mx-auto flex items-end space-x-6">
                {/* Avatar */}
                <div className="relative" onClick={() => setIsModalOpen(true)}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={t("user_detail.avatar_alt")}
                      className="w-44 h-44 rounded-full border-4 border-white shadow-2xl cursor-pointer transform hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <FaUserCircle className="w-44 h-44 text-gray-300" />
                  )}
                  <div className="absolute bottom-2 right-2 bg-gray-800 rounded-full p-2 cursor-pointer hover:bg-gray-700 transition-colors">
                    <FaUserCircle className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4 text-white">
                  <h1 className="text-4xl font-bold mb-2">{profile?.name}</h1>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <FaEnvelope className="w-4 h-4 mr-2" />
                      {profile?.email}
                    </div>
                    <div className="flex items-center">
                      <FaUserTag className="w-4 h-4 mr-2" />
                      {addSpaceBeforeCapitalLetters(profile?.systemRole)}
                    </div>
                    <div className="flex items-center">
                      <FaBuilding className="w-4 h-4 mr-2" />
                      {addSpaceBeforeCapitalLetters(profile?.department)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white dark:bg-[#242526] rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FaBriefcase className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold dark:text-white">
                    {t("user_detail.current_projects")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile?.project && profile.project.length > 0 ? (
                    profile.project.map((project) => (
                      <div
                        key={project.id}
                        className="bg-gray-50 dark:bg-[#3A3B3C] rounded-xl p-4 hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {project.name || t("user_detail.unnamed_project")}
                            </h3>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="inline-block w-16">
                                  {t("user_detail.status")}:
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    project.status === "Active"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  }`}
                                >
                                  {project.status}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span className="inline-block w-16">
                                  {t("user_detail.budget")}:
                                </span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  ${project.budget.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                      {t("user_detail.no_projects")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h4 className="text-xl font-semibold dark:text-white mb-4">
                  {t("user_detail.update_profile_photo")}
                </h4>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#3A3B3C] dark:text-white"
                />
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleImageUpload}
                    className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {t("common.update")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center dark:bg-[#18191A]">
          <p className="text-gray-500 dark:text-gray-400">
            {t("user_detail.no_user_info")}
          </p>
        </div>
      )}
    </CommonLayout>
  );
}

export default UserDetail;
