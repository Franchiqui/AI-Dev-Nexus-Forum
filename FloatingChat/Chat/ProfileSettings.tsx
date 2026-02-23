import React, { useState } from 'react';
import { usePocketBase } from './PocketBaseContext';
import { useLanguage } from './LanguageContext';
import { Button } from '@/FloatingChat/ui/button';
import { Input } from '@/FloatingChat/ui/input';
import { Label } from '@/FloatingChat/ui/label';
import { User, Camera, Save, X } from 'lucide-react';

export function ProfileSettings({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { pb, user } = usePocketBase();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('address', address);

      if (avatar) {
        formData.append('avatar', avatar);
      }

      await pb.collection('users').update(user.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{user?.name || user?.username}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-[130px] h-[130px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : user?.avatar ? (
                <img
                  src={`${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}?thumb=200x200`}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    console.error('Error loading avatar:', user.avatar, 'Full URL:', `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}`);
                  }}
                />
              ) : (
                <User className="w-[25px] h-[25px] text-gray-400" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 cursor-pointer">
              <Camera className="w-5 h-5 text-white drop-shadow-md" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t.common.name}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder={t.common.fullName}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t.common.phone}</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              placeholder={t.common.phoneNumber}
            />
          </div>

          <div>
            <Label htmlFor="address">{t.common.address}</Label>
            <Input
              id="address"
              value={address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              placeholder="Dirección"
            />
          </div>

          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          {t.common.cancel}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              {t.common.save}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t.common.save}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
