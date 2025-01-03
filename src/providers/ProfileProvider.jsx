"use client";
import React, {
  createContext,
  useState,
  useLayoutEffect,
  useEffect,
} from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const getProfile = async () => {
    // if (!session?.user) {
    //   // Avoid fetching profile if session is not available
    //   return profile;
    // }

    setLoading(true);

    try {
      const response = await axios.get("/api/profile/get-profile");

      if (response?.data?.success) {
        setProfile(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  // useLayoutEffect(() => {
  //   if (session?.user) {
  //     // Fetch profile only if session is available and profile doesn't exist
  //     getProfile();
  //   }
  // }, [session]);

  // useEffect(() => {
  //   if (!session?.user) {
  //     setProfile(null); // Clear profile if user logs out
  //   }
  // }, [session]);

  // useLayoutEffect(() => {}, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch profile only if session is available and profile doesn't exist
      getProfile();
    } else {
      setProfile(null); // Clear profile if user logs out
    }
  }, [session]);

  return (
    <ProfileContext.Provider value={{ getProfile, profile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

// "use client";
// import React, {
//   createContext,
//   useState,
//   useLayoutEffect,
//   useEffect,
// } from "react";
// import axios from "axios";
// import { useSession, getSession } from "next-auth/react";

// export const ProfileContext = createContext();

// export const ProfileProvider = ({ children }) => {
//   const { data: session } = useSession();
//   const [profile, setProfile] = useState(null);

//   const getProfile = async () => {
//     console.log("context:getProfile");
//     return await axios
//       .get("/api/profile/get-profile")
//       .then((response) => {
//         console.log("Profile data:", response.data);
//         if (response?.data?.success) {
//           setProfile(response.data.data);
//           return response.data.data;
//         }
//         return null;
//       })
//       .catch((error) => {
//         // console.error("Error fetching profile:", error);
//         return null;
//       });
//   };

//   useLayoutEffect(() => {
//     if (session?.user) {
//       getProfile();
//     }
//   }, [session]);

//   useEffect(() => {
//     if (!session?.user) {
//       setProfile(null);
//     }
//   }, [session]);

//   return (
//     <ProfileContext.Provider value={{ getProfile, profile }}>
//       {children}
//     </ProfileContext.Provider>
//   );
// };
