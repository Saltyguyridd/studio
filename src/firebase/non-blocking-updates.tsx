'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  UpdateData,
  WithFieldValue,
  DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates a setDoc operation.
 */
export function setDocumentNonBlocking<T extends DocumentData>(
  docRef: DocumentReference<T>, 
  data: WithFieldValue<T>, 
  options: SetOptions = {}
) {
  setDoc(docRef, data, options).catch(() => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data as Record<string, unknown>,
      })
    );
  });
}

/**
 * Initiates an addDoc operation.
 */
export function addDocumentNonBlocking<T extends DocumentData>(
  colRef: CollectionReference<T>, 
  data: WithFieldValue<T>
) {
  return addDoc(colRef, data).catch(() => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data as Record<string, unknown>,
      })
    );
  });
}

/**
 * Initiates an updateDoc operation.
 */
export function updateDocumentNonBlocking<T extends DocumentData>(
  docRef: DocumentReference<T>, 
  data: UpdateData<T>
) {
  updateDoc(docRef, data).catch(() => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data as Record<string, unknown>,
      })
    );
  });
}

/**
 * Initiates a deleteDoc operation.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef).catch(() => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      })
    );
  });
}
