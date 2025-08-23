import React from 'react'; import { useForm } from 'react-hook-form'; import { useCreatePatientMutation } from '@/services/patients.api';
export default function AddPatient(){
  const { register, handleSubmit, reset } = useForm(); const [save] = useCreatePatientMutation();
  const onSubmit = async (data)=>{ await save(data).unwrap(); reset(); alert('Created'); };
  return <div className="p-6"><h2 className="text-lg font-semibold mb-3">Add Patient</h2>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input className="border p-2 w-full" placeholder="Name" {...register('name')} />
      <input className="border p-2 w-full" placeholder="DOB (YYYY-MM-DD)" {...register('dob')} />
      <select className="border p-2 w-full" {...register('sex')}><option value="">Sex</option><option>M</option><option>F</option></select>
      <button className="bg-black text-white px-4 py-2 rounded">Save</button>
    </form></div>;
}
