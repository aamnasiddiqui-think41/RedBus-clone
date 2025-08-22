
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Card } from '../components/shared/Card';
import { Loader } from '../components/shared/Loader';
import { TextInput, Select } from '../ui/atoms/Input';

export const PersonalInfoPage = () => {
  const { token, user, userProfile, getMyProfile, updateMe, loading, isInitializing } = useStore();
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    dob: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Only redirect if we're sure there's no session (after initialization)
    if (token === null && user === null) {
      navigate('/login');
      return;
    }

    // If we have a token, fetch enhanced profile data
    if (token && user) {
      getMyProfile(token);
    }
  }, [token, user, navigate]); // Remove getMyProfile from dependencies to prevent infinite loop

  useEffect(() => {
    // Initialize form with existing user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || '',
        dob: user.dob || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await updateMe(token, formData);
      setShowSuccess(true);
      setShowForm(false);
      
      // Refresh profile data
      setTimeout(() => {
        getMyProfile(token);
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDetails = () => {
    setShowForm(true);
    setShowSuccess(false);
  };

  // Wait for auth initialization to complete
  if (isInitializing) {
    return <Loader />;
  }

  // If no session after initialization, redirect to login
  if (!token || !user) {
    // Don't call navigate here - let useEffect handle it
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your personal information and view your profile.</p>
        </div>

        {/* Wallet and Statistics Section */}
        {userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{userProfile.wallet_balance}</div>
                <div className="text-sm text-gray-600">Wallet Balance</div>
                <div className="text-xs text-gray-500">₹75 per booking</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userProfile.total_bookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
                <div className="text-xs text-gray-500">Lifetime count</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">₹{userProfile.total_amount_spent}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
                <div className="text-xs text-gray-500">On all bookings</div>
              </div>
            </Card>
          </div>
        )}

        {/* Personal Details Section */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Details</h2>
            <p className="text-gray-600">Complete your profile to receive personalized offers</p>
          </div>

          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-green-600 text-2xl mr-3">🎉</div>
                <div>
                  <h3 className="text-green-800 font-semibold">Congratulations!</h3>
                  <p className="text-green-700 text-sm">Your profile is now complete. You'll receive personalized offers from now onwards!</p>
                </div>
              </div>
            </div>
          )}

          {!showForm && !userProfile?.personal_details_added && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-blue-800 font-semibold">Complete Your Profile</h3>
                  <p className="text-blue-700 text-sm">Add your personal details to receive personalized travel offers and recommendations.</p>
                </div>
                <button
                  onClick={handleAddDetails}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Details
                </button>
              </div>
            </div>
          )}

          {!showForm && userProfile?.personal_details_added && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-green-600 text-2xl mr-3">✅</div>
                <div>
                  <h3 className="text-green-800 font-semibold">Profile Complete</h3>
                  <p className="text-green-700 text-sm">Your profile is complete and you're receiving personalized offers!</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {user.name || <span className="text-gray-400 italic">Not provided</span>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {user.email || <span className="text-gray-400 italic">Not provided</span>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {user.gender || <span className="text-gray-400 italic">Not provided</span>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {user.dob || <span className="text-gray-400 italic">Not provided</span>}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="Enter your full name"
                  required
                />
                
                <TextInput
                  label="Email Address"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email"
                  type="email"
                  required
                />
                
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(value) => handleInputChange('gender', value)}
                  options={[
                    { value: '', label: 'Select gender' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  required
                />
                
                <TextInput
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(value) => handleInputChange('dob', value)}
                  type="date"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Details'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit Button for Complete Profiles */}
          {!showForm && userProfile?.personal_details_added && (
            <div className="pt-4">
              <button
                onClick={handleAddDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Details
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
