import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Note {
  id?: string;
  content: string;
  author: 'Hilton' | 'Rous';
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  username: 'Hilton' | 'Rous';
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private firestore = inject(Firestore);
  private notesCollection = collection(this.firestore, 'notes');
  private STORAGE_KEY_USER = 'current_user';

  login(name: string, pass: string): boolean {
    const formattedName = name.trim().toLowerCase();
    if (pass === '010125') {
      if (formattedName === 'hilton') {
        localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify({ username: 'Hilton' }));
        return true;
      } else if (formattedName === 'rous') {
        localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify({ username: 'Rous' }));
        return true;
      }
    }
    return false;
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.STORAGE_KEY_USER);
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY_USER);
  }

  // Esto devuelve un Observable<Note[]> para que funcione el subscribe() en app.ts
  getNotes(): Observable<Note[]> {
    const q = query(this.notesCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Note[]>;
  }

  async addNote(content: string) {
    const user = this.getCurrentUser();
    if (!user) return;

    const now = new Date();
    const formattedDate = now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    await addDoc(this.notesCollection, {
      content,
      author: user.username,
      createdAt: formattedDate
    });
  }

  async updateNote(id: string, newContent: string) {
    const now = new Date();
    const formattedDate = now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const noteDocRef = doc(this.firestore, `notes/${id}`);
    await updateDoc(noteDocRef, {
      content: newContent,
      updatedAt: formattedDate
    });
  }

  async deleteNote(id: string) {
    const noteDocRef = doc(this.firestore, `notes/${id}`);
    await deleteDoc(noteDocRef);
  }
}