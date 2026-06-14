import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { services } from "../services/serviceContainer";
import { setLocked } from "../store/sessionSlice";

type RootState = {
    session:{
        isUnlocked: boolean;
    };
    settings:{
        lockTimeoutSeconds: number;
    };
};

export function useAppLock(){
    const dispatch = useDispatch();

    const isUnlocked = useSelector(
        (state: RootState) => state.session.isUnlocked
    );

    const lockTimeoutSeconds = useSelector(
        (state: RootState) => state.settings.lockTimeoutSeconds
    );

    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const clearInactivityTimer = useCallback(()=>{
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null
        }
    },[]);

    const lock = useCallback(
        (reason: "manual" | "background" | "inactivity" | "reset" | "security") => {
            if (!services.appLockService.isUnlocked()) {
                return;
            }
            const result = services.appLockService.lock(reason);

            if(!result.ok){
                return;
            }

            dispatch (
                setLocked({
                    lockedAt: result.value.lockedAt,
                    reason: result.value.reason,
                })
            );
            clearInactivityTimer();
        }, [clearInactivityTimer,dispatch]
    );
    
    const resetInactivityTimer = useCallback(()=>{
        clearInactivityTimer();
        if(!isUnlocked){
            return;
        }
        inactivityTimerRef.current = setTimeout(()=>{
            lock("inactivity");
        },
    lockTimeoutSeconds *1000);
    },[clearInactivityTimer,isUnlocked,lock,lockTimeoutSeconds]);

    useEffect(()=>{
        function handleAppStateChange(nextState: AppStateStatus){
            if(nextState === "background" || nextState === "inactive"){
                lock("background");
            }
        }

        const subscription = AppState.addEventListener(
            "change",
            handleAppStateChange
        );

        return ()=>{
            subscription.remove();
        };
    },[lock]);

    useEffect(()=>{
        resetInactivityTimer();

        return()=>{
            clearInactivityTimer();
        }
    },[resetInactivityTimer,clearInactivityTimer]);

    return{
        lock,
        resetInactivityTimer
    };
}