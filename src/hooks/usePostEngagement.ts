/**
 * Custom hook for managing post engagement state
 * Consolidates complex engagement logic into a reducer for better performance
 */

import { useReducer, useCallback, useMemo } from 'react';

export interface EngagementState {
  isSaved: boolean;
  isLiked: boolean;
  isReposted: boolean;
  likeCount: number;
  repostCount: number;
  isUpdating: boolean;
  lastUpdateTime: number;
  pendingState: {
    isLiked?: boolean;
    isReposted?: boolean;
    isSaved?: boolean;
  } | null;
  showDeleteConfirm: boolean;
  explosionAnimations: {
    like: boolean;
    repost: boolean;
    save: boolean;
  };
}

export type EngagementAction =
  | { type: 'SET_LIKED'; payload: boolean }
  | { type: 'SET_REPOSTED'; payload: boolean }
  | { type: 'SET_SAVED'; payload: boolean }
  | { type: 'SET_LIKE_COUNT'; payload: number }
  | { type: 'SET_REPOST_COUNT'; payload: number }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_LAST_UPDATE_TIME'; payload: number }
  | { type: 'SET_PENDING_STATE'; payload: EngagementState['pendingState'] }
  | { type: 'SET_DELETE_CONFIRM'; payload: boolean }
  | { type: 'SET_EXPLOSION'; payload: { type: 'like' | 'repost' | 'save'; value: boolean } }
  | { type: 'INIT_FROM_POST'; payload: { likes?: { userId: string }[]; reposts?: { userId: string }[]; savedBy?: { userId: string }[]; userId: string } }
  | { type: 'RESET' };

const initialState: EngagementState = {
  isSaved: false,
  isLiked: false,
  isReposted: false,
  likeCount: 0,
  repostCount: 0,
  isUpdating: false,
  lastUpdateTime: 0,
  pendingState: null,
  showDeleteConfirm: false,
  explosionAnimations: { like: false, repost: false, save: false },
};

function engagementReducer(state: EngagementState, action: EngagementAction): EngagementState {
  switch (action.type) {
    case 'SET_LIKED':
      return { ...state, isLiked: action.payload };
    case 'SET_REPOSTED':
      return { ...state, isReposted: action.payload };
    case 'SET_SAVED':
      return { ...state, isSaved: action.payload };
    case 'SET_LIKE_COUNT':
      return { ...state, likeCount: action.payload };
    case 'SET_REPOST_COUNT':
      return { ...state, repostCount: action.payload };
    case 'SET_UPDATING':
      return { ...state, isUpdating: action.payload };
    case 'SET_LAST_UPDATE_TIME':
      return { ...state, lastUpdateTime: action.payload };
    case 'SET_PENDING_STATE':
      return { ...state, pendingState: action.payload };
    case 'SET_DELETE_CONFIRM':
      return { ...state, showDeleteConfirm: action.payload };
    case 'SET_EXPLOSION':
      return {
        ...state,
        explosionAnimations: {
          ...state.explosionAnimations,
          [action.payload.type]: action.payload.value,
        },
      };
    case 'INIT_FROM_POST': {
      const { likes, reposts, savedBy, userId } = action.payload;
      return {
        ...state,
        isLiked: likes?.some(like => like.userId === userId) || false,
        isReposted: reposts?.some(repost => repost.userId === userId) || false,
        isSaved: savedBy?.some(saved => saved.userId === userId) || false,
        likeCount: likes?.length || 0,
        repostCount: reposts?.length || 0,
      };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function usePostEngagement() {
  const [state, dispatch] = useReducer(engagementReducer, initialState);

  const actions = useMemo(
    () => ({
      setLiked: (liked: boolean) => dispatch({ type: 'SET_LIKED', payload: liked }),
      setReposted: (reposted: boolean) => dispatch({ type: 'SET_REPOSTED', payload: reposted }),
      setSaved: (saved: boolean) => dispatch({ type: 'SET_SAVED', payload: saved }),
      setLikeCount: (count: number) => dispatch({ type: 'SET_LIKE_COUNT', payload: count }),
      setRepostCount: (count: number) => dispatch({ type: 'SET_REPOST_COUNT', payload: count }),
      setUpdating: (updating: boolean) => dispatch({ type: 'SET_UPDATING', payload: updating }),
      setLastUpdateTime: (time: number) => dispatch({ type: 'SET_LAST_UPDATE_TIME', payload: time }),
      setPendingState: (pending: EngagementState['pendingState']) => dispatch({ type: 'SET_PENDING_STATE', payload: pending }),
      setDeleteConfirm: (confirm: boolean) => dispatch({ type: 'SET_DELETE_CONFIRM', payload: confirm }),
      setExplosion: (type: 'like' | 'repost' | 'save', value: boolean) =>
        dispatch({ type: 'SET_EXPLOSION', payload: { type, value } }),
      initFromPost: (likes: { userId: string }[], reposts: { userId: string }[], savedBy: { userId: string }[], userId: string) =>
        dispatch({ type: 'INIT_FROM_POST', payload: { likes, reposts, savedBy, userId } }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  );

  return { state, ...actions };
}

