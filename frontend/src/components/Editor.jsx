import React, { useCallback, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean']
];

const SAVE_INTERVAL_MS = 2000;

export default function Editor() {
  const { id: documentId } = useParams();
  const socketRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    socketRef.current = s;
    return () => s.disconnect();
  }, []);

  const wrapperRef = useCallback(wrapper => {
    if (!wrapper) return;
    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);
    const q = new Quill(editor, { theme: 'snow', modules: { toolbar: TOOLBAR_OPTIONS } });
    q.disable();
    q.setText('Loading...');
    quillRef.current = q;
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill || !documentId) return;

    socket.once('load-document', document => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit('get-document', documentId);
  }, [documentId]);

  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill) return;

    const handler = delta => quill.updateContents(delta);
    socket.on('receive-changes', handler);

    return () => socket.off('receive-changes', handler);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill) return;

    const handler = (delta, _oldDelta, source) => {
      if (source !== 'user') return;
      socket.emit('send-changes', delta);
    };

    quill.on('text-change', handler);
    return () => quill.off('text-change', handler);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container" style={{ height: '100vh' }}>
      <div ref={wrapperRef} style={{ height: '100%' }} />
    </div>
  );
}
