import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotesService, Note, User } from './services/notes';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private notesService = inject(NotesService);
  private notesSub?: Subscription;

  currentUser: User | null = null;
  notes: Note[] = [];

  // Formulario Login
  username = '';
  password = '';
  loginError = '';

  // Formulario Nueva Nota
  newNoteContent = '';

  // Estado de Edición
  editingNoteId: string | null = null;
  editingContent = '';

  ngOnInit() {
    this.currentUser = this.notesService.getCurrentUser();
    if (this.currentUser) {
      this.subscribeToNotes();
    }
  }

  ngOnDestroy() {
    this.notesSub?.unsubscribe();
  }

  private subscribeToNotes() {
    this.notesSub = this.notesService.getNotes().subscribe({
      next: (data) => {
        this.notes = data;
      },
      error: (err) => console.error('Error al escuchar notas:', err)
    });
  }

  onLogin() {
    const success = this.notesService.login(this.username, this.password);
    if (success) {
      this.currentUser = this.notesService.getCurrentUser();
      this.subscribeToNotes();
      this.loginError = '';
    } else {
      this.loginError = 'Nombre o contraseña incorrectos';
    }
  }

  async addNote() {
    if (!this.newNoteContent.trim()) return;
    await this.notesService.addNote(this.newNoteContent);
    this.newNoteContent = '';
  }

  startEditing(note: Note) {
    if (!note.id) return;
    this.editingNoteId = note.id;
    this.editingContent = note.content;
  }

  cancelEditing() {
    this.editingNoteId = null;
    this.editingContent = '';
  }

  async saveEdit(id: string) {
    if (!this.editingContent.trim()) return;
    await this.notesService.updateNote(id, this.editingContent);
    this.editingNoteId = null;
    this.editingContent = '';
  }

  async deleteNote(id: string) {
    await this.notesService.deleteNote(id);
  }

  logout() {
    this.notesSub?.unsubscribe();
    this.notesService.logout();
    this.currentUser = null;
  }
}
