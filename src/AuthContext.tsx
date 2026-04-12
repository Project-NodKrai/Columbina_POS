import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';

interface Store {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
}

interface AuthContextType {
  user: User | null;
  store: Store | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      
      // Check for subdomain in URL
      const hostname = window.location.hostname;
      const urlSubdomain = hostname.endsWith('.pos.n-e.kr') ? hostname.split('.')[0] : null;

      if (firebaseUser) {
        // Try to find the store owned by this user
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('ownerId', '==', firebaseUser.uid));
        
        const unsubscribeStore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const storeDoc = snapshot.docs[0];
            setStore({ id: storeDoc.id, ...storeDoc.data() } as Store);
          } else {
            setStore(null);
          }
          setLoading(false);
        });

        return () => unsubscribeStore();
      } else if (urlSubdomain) {
        // If not logged in but on a subdomain, try to load that store for Kiosk mode
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('subdomain', '==', urlSubdomain));
        
        const unsubscribeStore = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const storeDoc = snapshot.docs[0];
            setStore({ id: storeDoc.id, ...storeDoc.data() } as Store);
          }
          setLoading(false);
        });
        return () => unsubscribeStore();
      } else {
        setStore(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, store, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
