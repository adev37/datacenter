// store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  clearAuth as clearStore,
  saveAuth,
  loadAuth,
} from "@/utils/authStorage";

const persisted = loadAuth();
const initial = persisted || { token: null, user: null, branchId: null };

const slice = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    setAuth(state, { payload }) {
      state.token = payload.accessToken ?? payload.token ?? state.token;
      state.user = payload.user ?? state.user;
      if (!state.branchId && (state.user?.branches?.length || 0) > 0) {
        state.branchId = state.user.branches[0];
      }
      saveAuth({
        token: state.token,
        user: state.user,
        branchId: state.branchId,
      });
    },
    setBranch(state, { payload }) {
      state.branchId = payload;
      saveAuth({
        token: state.token,
        user: state.user,
        branchId: state.branchId,
      });
    },
    signOut() {
      clearStore();
      return { token: null, user: null, branchId: null };
    },
  },
});

export const { setAuth, setBranch, signOut } = slice.actions;
export default slice.reducer;
