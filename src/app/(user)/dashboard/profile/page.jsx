'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UserProfileForm from "@/components/ui/UserProfileForm";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

//validation
const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .matches(/^\d+$/, 'Phone number must be digits only')
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
});

const UserProfile = () => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    console.log("user", session?.user)

  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        if (session?.user?.uid) {
          const response = await fetch(`/api/profile/get-user-profile/${session?.user?.uid}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            //body: JSON.stringify({ user: { uid: session.user.uid } }),
          });
          const data = await response.json();

          if (response.ok) {
            setProfile(data.profile);
          } else {
            setError(data.error || "Failed to fetch profile");
          }
        } else {
          setError('No UID found in session');
        }
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.uid) {
      fetchProfile();
    }
  }, [session?.user?.uid]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Please sign in to view your profile</p>;

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;

  return profile ? (
    <UserProfileForm profile={profile} session={session}/>
  ) : (
    <p>No profile data found</p>
  );
};

export default UserProfile;
