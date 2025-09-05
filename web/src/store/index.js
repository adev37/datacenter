import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/baseApi";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (gDM) =>
    gDM({
      serializableCheck: false, // FormData, Dates, etc.
    }).concat(api.middleware),
  devTools: import.meta.env.DEV,
});

export default store;
