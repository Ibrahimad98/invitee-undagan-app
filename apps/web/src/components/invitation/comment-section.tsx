'use client';

import { useState } from 'react';
import { useCommentsPublic, useCreateCommentPublic } from '@/hooks/queries/use-comments-public';
import { formatDate } from '@invitee/shared';
import { useScrollAnimation, animClass } from '@/hooks/use-scroll-animation';
import SectionOrnament from './section-ornament';

interface CommentSectionProps {
  invitationId: string;
}

export default function CommentSection({ invitationId }: CommentSectionProps) {
  const { data: comments, isLoading, refetch } = useCommentsPublic(invitationId);
  const createComment = useCreateCommentPublic();
  const { ref, isVisible } = useScrollAnimation(0.1);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    try {
      await createComment.mutateAsync({
        invitationId,
        name: name.trim(),
        message: message.trim(),
      });
      setName('');
      setMessage('');
      setSubmitted(true);
      refetch();
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  return (
    <section
      ref={ref}
      className="invitation-section invitation-comments px-8 sm:px-12 py-14 sm:py-16 bg-[var(--inv-bg-primary)] text-[var(--inv-text-primary)]"
    >
      <SectionOrnament position="frame" />

      <div className={`max-w-md mx-auto space-y-6 sm:space-y-8 w-full ${animClass(isVisible, 'fade-up')}`}>
        <div className="text-center space-y-2">
          <h3 className="text-xs sm:text-sm uppercase tracking-widest text-[var(--inv-text-secondary)]">
            Komentar
          </h3>
          <p className="text-xs text-[var(--inv-text-secondary)]">
            Tinggalkan pesan untuk kami
          </p>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--inv-text-secondary)]">
              Nama
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl bg-[var(--inv-bg-primary)] border border-[var(--inv-accent)]/20 text-[var(--inv-text-primary)] text-sm focus:ring-2 focus:ring-[var(--inv-accent)] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--inv-text-secondary)]">
              Pesan
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis komentar atau pesan Anda di sini..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl bg-[var(--inv-bg-primary)] border border-[var(--inv-accent)]/20 text-[var(--inv-text-primary)] text-sm focus:ring-2 focus:ring-[var(--inv-accent)] outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={createComment.isPending || !name.trim() || !message.trim()}
            className="w-full px-6 py-3 bg-[var(--inv-accent)] text-[var(--inv-accent-text)] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createComment.isPending ? 'Mengirim...' : 'Kirim Komentar'}
          </button>

          {submitted && (
            <p className="text-center text-xs text-green-600">
              ✓ Komentar berhasil dikirim!
            </p>
          )}
        </form>

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[var(--inv-bg-secondary)] animate-pulse"
              >
                <div className="h-3 bg-[var(--inv-accent)]/10 rounded w-1/3 mb-2" />
                <div className="h-3 bg-[var(--inv-accent)]/10 rounded w-3/4 mb-1" />
                <div className="h-3 bg-[var(--inv-accent)]/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto pr-1 invitation-wishes-scroll">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 sm:p-4 rounded-xl bg-[var(--inv-bg-secondary)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{comment.name}</p>
                </div>
                <p className="text-sm text-[var(--inv-text-secondary)] leading-relaxed">
                  {comment.message}
                </p>
                <p className="text-xs text-[var(--inv-text-secondary)] opacity-60">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-[var(--inv-text-secondary)] opacity-60">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        )}
      </div>
    </section>
  );
}
