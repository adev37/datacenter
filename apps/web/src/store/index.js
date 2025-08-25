// apps/web/src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/baseApi";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
  middleware: (gDM) => gDM().concat(api.middleware),
});

export default store;
