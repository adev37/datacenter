import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useCreatePatientMutation } from "@/services/patients.api";

export default function AddPatient() {
  const navigate = useNavigate();
  const [createPatient, { isLoading, error }] = useCreatePatientMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { sex: "U" },
  });

  const onSubmit = async (values) => {
    const payload = {
      name: { first: values.first, middle: values.middle, last: values.last },
      dob: values.dob || undefined,
      sex: values.sex,
      phones: values.phone ? [values.phone] : [],
      email: values.email || undefined,
    };
    const res = await createPatient(payload).unwrap();
    navigate(`/patients/${res._id}`);
  };

  const serverMsg = error?.data?.message;

  return (
    <div className="max-w-xl p-4 space-y-3">
      <h1 className="text-xl font-semibold">Add Patient</h1>

      {serverMsg && (
        <div className="rounded bg-red-50 border border-red-200 text-red-700 text-sm p-2">
          {serverMsg}
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              className="border rounded px-3 py-2 w-full"
              {...register("first", { required: "First name is required" })}
            />
            {errors.first && (
              <p className="text-red-600 text-sm">{errors.first.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Middle</label>
            <input
              className="border rounded px-3 py-2 w-full"
              {...register("middle")}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              className="border rounded px-3 py-2 w-full"
              {...register("last")}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">DOB (YYYY-MM-DD)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="1995-08-30"
              {...register("dob")}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Sex</label>
            <select
              className="border rounded px-3 py-2 w-full"
              {...register("sex")}>
              <option value="U">Unknown</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              className="border rounded px-3 py-2 w-full"
              {...register("phone")}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Email</label>
            <input
              className="border rounded px-3 py-2 w-full"
              {...register("email")}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded">
            {isLoading ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
