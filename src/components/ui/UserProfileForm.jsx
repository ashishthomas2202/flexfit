import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig"; // Import Firestore and Storage

const profileSchema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    phoneNumber: yup
        .string()
        .matches(/^\d+$/, 'Phone number must be digits only')
        .min(10, 'Phone number must be at least 10 digits')
        .required('Phone number is required'),
    DOB: yup.string().required('Date of Birth is required'),
    gender: yup.string().required('Gender is required'),
    height: yup.number().required('Height is required').positive('Height must be positive'),
    weight: yup.number().required('Weight is required').positive('Weight must be positive'),
});

const UserProfileForm = ({ profile, session }) => {
    const [formData, setFormData] = useState(profile || {
        firstName: '',
        lastName: '',
        gender: '',
        DOB: '',
        height: '',
        weight: '',
        phoneNumber: '',
        profilePicture: '',
        uid: session?.user?.uid || '', // Ensure UID is pre-filled
    });

    const [imagePreview, setImagePreview] = useState('/default-user-icon.png');
    const [profilePictureFile, setProfilePictureFile] = useState(null);

    useEffect(() => {
        if (formData.profilePicture && typeof formData.profilePicture === 'string') {
            setImagePreview(formData.profilePicture); // Display the current profile picture URL
        }
    }, [formData.profilePicture]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageURL = URL.createObjectURL(file);
            setImagePreview(imageURL); // Preview the image before upload
            setProfilePictureFile(file); // Store the file for upload later
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!session || !session.user || !session.user.uid) {
            alert('You must be logged in to update your profile.');
            return;
        }

        let profilePictureURL = formData.profilePicture;

        if (profilePictureFile) {
            try {
                const storageRef = ref(storage, `profilePictures/${session.user.uid}/${profilePictureFile.name}`);
                const snapshot = await uploadBytes(storageRef, profilePictureFile);
                profilePictureURL = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                return;
            }
        }

        const updatedProfileData = {
            ...formData,
            profilePicture: profilePictureURL,
            uid: session.user.uid // Ensure UID is included
        };

        try {
            const response = await fetch('/api/profile/update-user-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: { uid: session.user.uid }, // Send the user's UID for profile lookup
                    profileData: updatedProfileData,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile updated successfully');
            } else {
                console.error('Error updating profile:', data.error);
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Input fields */}
            <label>
                First Name:
                <Input
                    type="text"
                    name="firstName"
                    {...register('firstName')}
                    style={styles.input}
                />
                {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
            </label>

            {/* Last Name */}
            <label>
                Last Name:
                <Input
                    type="text"
                    name="lastName"
                    {...register('lastName')}
                    style={styles.input}
                />
                {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
            </label>

            {/* Phone Number */}
            <label>
                Phone Number:
                <Input
                    type="text"
                    name="phoneNumber"
                    {...register('phoneNumber')}
                    style={styles.input}
                />
                {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber.message}</p>}
            </label>

            {/* Date of Birth */}
            <label>
                Date of Birth (MM/DD/YYYY):
                <Input
                    type="text"
                    name="DOB"
                    {...register('DOB')}
                    style={styles.input}
                />
                {errors.DOB && <p className="text-red-500">{errors.DOB.message}</p>}
            </label>

            {/* Gender */}
            <label>
                Gender:
                <select
                    name="gender"
                    {...register('gender')}
                    style={styles.input}
                >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
            </label>

            {/* Height */}
            <label>
                Height (inches):
                <Input
                    type="number"
                    name="height"
                    {...register('height')}
                    style={styles.input}
                />
                {errors.height && <p className="text-red-500">{errors.height.message}</p>}
            </label>

            {/* Weight */}
            <label>
                Weight (lbs):
                <Input
                    type="number"
                    name="weight"
                    {...register('weight')}
                    style={styles.input}
                />
                {errors.weight && <p className="text-red-500">{errors.weight.message}</p>}
            </label>

            {/* Profile Picture */}
            <label>
                Profile Picture:
                <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    style={styles.input}
                />
                <div style={styles.imageContainer}>
                    <img src={imagePreview} alt="Profile Preview" style={styles.profileImage} />
                </div>
            </label>
            
            <button type="submit" style={styles.button}>Update Profile</button>
        </form>
    );
};
// Styles 
const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '300px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        color: '#000',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid lightgrey',
        width: '100%',
        backgroundColor: '#fff',
        color: '#000',
    },
    button: {
        padding: '10px',
        backgroundColor: '#8b5cf6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    imageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '150px',
        height: '150px',
        margin: '0 auto',
        borderRadius: '50%',
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
        marginBottom: '20px',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
};

export default UserProfileForm;
