'use client';

import React, { useState } from 'react';
import { Box, Text, Textarea, Button, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  getDatabase,
  ref as dbRef,
  get,
  update,
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  listAll,
  deleteObject,
} from 'firebase/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestoredb } from '@/app/api/firebase';

export default function DeleteAccountPage() {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;
  const dbRT = getDatabase();
  const storage = getStorage();
  const dbFS = firestoredb;

  // 1) Prompt for password & re-authenticate
  const promptReauth = async (): Promise<boolean> => {
    if (!user) return false;
    const pw = window.prompt('Biztonsági okokból kérjük adja meg újra a jelszavát:');
    if (!pw) return false;
    try {
      const cred = EmailAuthProvider.credential(user.email!, pw);
      await reauthenticateWithCredential(user, cred);
      return true;
    } catch {
      alert('Helytelen jelszó – nem sikerült újra bejelentkezni.');
      return false;
    }
  };

  // 2) Log reason
  const logDeletionReason = async () => {
    if (!uid) return;
    const entryId = `DELETE_${uid}`;
    const now = new Date().toLocaleString('hu-HU');
    try {
      await setDoc(doc(dbFS, 'contact', entryId), {
        userID: uid,
        date: now,
        message: reason || 'no reason provided',
        action: 'delete_account',
      });
    } catch (err) {
      console.error('Error logging deletion reason:', err);
    }
  };

  // 3) Delete Auth only
  const handleDeleteProfile = async () => {
    if (!user) return;
    setLoading(true);

    // re-auth
    const ok = await promptReauth();
    if (!ok) { setLoading(false); return; }

    // log reason
    await logDeletionReason();

    try {
      await deleteUser(user);
      router.push('/');
    } catch (err) {
      console.error('Error deleting profile:', err);
      alert('Nem sikerült törölni a profilt.');
    } finally {
      setLoading(false);
    }
  };

  // 4) Delete everything + confirm dialog
  const handleDeleteAll = async () => {
    if (!user || !uid) return;
    setLoading(true);

    // re-auth
    const ok = await promptReauth();
    if (!ok) { setLoading(false); return; }

    // confirm
    if (!window.confirm('Biztos benne, hogy töröl minden adatot?')) {
      setLoading(false);
      return;
    }

    // log reason
    await logDeletionReason();

    try {
      // ─── Firestore “users/{uid}” ───
      await deleteDoc(doc(dbFS, 'users', uid));

      // ─── RTDB: delete answers/{uid} & decrement counts ───
      const rootPath = 'database/categories';
      const catsSnap = await get(dbRef(dbRT, rootPath));
      if (catsSnap.exists()) {
        const cats = catsSnap.val() as Record<string, any>;
        const multiUpdate: Record<string, null | number> = {};

        for (const catKey of Object.keys(cats)) {
          const concepts = cats[catKey].concepts || {};
          for (const conKey of Object.keys(concepts)) {
            const answersPath = `${rootPath}/${catKey}/concepts/${conKey}/answers`;
            const ansSnap = await get(dbRef(dbRT, answersPath));
            if (!ansSnap.exists()) continue;

            let removed = 0;
            // delete by matching the child key === uid
            ansSnap.forEach(child => {
              if (child.key === uid) {
                multiUpdate[`${answersPath}/${child.key}`] = null;
                removed++;
              }
            });

            if (removed > 0) {
              const oldCount = concepts[conKey].answer_count || 0;
              multiUpdate[
                `${rootPath}/${catKey}/concepts/${conKey}/answer_count`
              ] = Math.max(0, oldCount - removed);
            }
          }
        }

        if (Object.keys(multiUpdate).length) {
          await update(dbRef(dbRT), multiUpdate);
        }
      }

      // ─── Storage “user-logs/{uid}” ───
      const logs = await listAll(storageRef(storage, `user-logs/${uid}`));
      await Promise.all(logs.items.map(i => deleteObject(i)));

      // ─── Storage “user-audio/{concept}/${uid}” ───
      const audioRoot = storageRef(storage, 'user-audio');
      const conceptFolders = await listAll(audioRoot);
      await Promise.all(
        conceptFolders.prefixes.map(async cf => {
          const userFolder = storageRef(storage, `${cf.fullPath}/${uid}`);
          const files = await listAll(userFolder);
          await Promise.all(files.items.map(f => deleteObject(f)));
        })
      );

      // ─── Finally delete Auth user ───
      await deleteUser(user);
      router.push('/');
    } catch (err) {
      console.error('Error deleting all data:', err);
      alert('Hiba a teljes törlés során.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="relative"
      zIndex={1}
      maxW="container.md"
      mx="auto"
      w="70%"
      px={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Text mb={6} fontSize="2xl" fontWeight="bold" textAlign="center">
      Kutatásunkban kulcsfontosságú, hogy minél több adatot gyűjtsünk a gyermeki nyelv működéséről, ezért nagyon sokat segítene, ha megosztaná velünk, hogy miért szeretné törölni a profilját.
      </Text>

      <Textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Kérjük, írja le röviden az okokat..."
        mb={6}
        h="20vh"
        bg="white"
        borderColor="black"
        borderWidth="1px"
        fontSize="xl"
        textAlign="center"
      />

      <Text mb={6} fontSize="xl" textAlign="center">
        Amennyiben profilját szeretné eltávolítani, de hozzájárul, hogy az eddigi adatokat még felhasználjuk kutatásunkban, akkor kérjük a &quot;Csak a profilom törlése&quot; gombot válassza. 
        Ha az eddigi adatokat is szeretné eltávolítani, akkor a &quot;Az adataim és a profilom törlése&quot; gombot válassza.
      </Text>

      <VStack gap={4} width="100%">
        <Button
          onClick={handleDeleteProfile}
          loading={loading}
          width="60%"
          bg="red.500"
          color="white"
          fontSize="xl"
          _hover={{ bg: 'red.600' }}
        >
          Csak a profilom törlése
        </Button>
        <Button
          variant="outline"
          onClick={handleDeleteAll}
          loading={loading}
          width="60%"
          bg="white"
          borderColor="red.500"
          color="red.500"
          fontSize="xl"
          _hover={{ bg: 'red.50' }}
        >
          Az adataim és a profilom törlése
        </Button>
      </VStack>
    </Box>
  );
}
