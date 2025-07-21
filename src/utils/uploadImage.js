export async function uploadImageToCloudinary(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', 'react_profile_preset');
  const res = await fetch(
    'https://api.cloudinary.com/v1_1/dkijvk8aq/image/upload',
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error('Upload avatar fallito');
  const data = await res.json();
  return data.secure_url; 
}