import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

type LogginSession ={
    user: string;
    reLoginCode: string;
}
type AuthState = {
    user: string | null;
    reloginCode: string | null;
    status: "idle" | "loading" | "authenticated" |"error";
    error: string | null;
}
const initialState: AuthState = {
    user: null,
    reloginCode: null,
    status: "idle",
    error: null,
}
export const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        logginStart(state){
            state.status = "loading";
            state.error = null;
        },
        logginSuccess(state,action: PayloadAction<LogginSession>){
            state.user = action.payload.user;
            state.reloginCode = action.payload.reLoginCode;
            state.status = "authenticated";
            state.error = null;
        },
        logginFail(state,action: PayloadAction<string>){
            state.user = null;
            state.reloginCode = null;
            state.status = "error";
            state.error = action.payload;
        },
        sessionLost(){
            return {
                ...initialState,error:"Kết nối đóng, hãy đăng nhập lại.",
            }
        },
    },
})
export const {logginStart, logginSuccess, logginFail, sessionLost} = authSlice.actions;