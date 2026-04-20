import { showToast } from './toast.js';
import { createPost, uploadPostMedia } from '../api/posts.js';
import { trackEvent, logError } from '../observability/telemetry.js';
import { closeComposer } from '../domBindings.js';
import { isGuestMode } from '../utils/guestMode.js';

export function initPostComposer({ user } = {}) {
  const submitBtn = document.getElementById('submit-post-btn');
  const textArea = document.getElementById('post-text');
  const fileInput = document.getElementById('post-file');
  const mediaPicker = document.getElementById('media-picker');
  const mediaHint = document.getElementById('media-hint');
  const mediaPreview = document.getElementById('post-media-preview');
  const removeMediaBtn = document.getElementById('remove-media-btn');
  const videoPreview = document.getElementById('post-video-preview');
  const imagePreview = document.getElementById('post-image-preview');
  const typeButtons = Array.from(document.querySelectorAll('.composer-type'));

  if (!submitBtn || !textArea) return () => {};

  let submitting = false;
  let objectUrl = '';
  let postType = 'video';
  let selectedFile = null;

  const resetPreview = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = '';
    if (mediaPreview) mediaPreview.classList.add('hidden');
    if (videoPreview) {
      videoPreview.pause?.();
      videoPreview.removeAttribute('src');
      videoPreview.load?.();
      videoPreview.classList.add('hidden');
    }
    if (imagePreview) {
      imagePreview.removeAttribute('src');
      imagePreview.classList.add('hidden');
    }
  };

  const setType = (type) => {
    postType = type;
    typeButtons.forEach((b) => b.classList.toggle('active', b.dataset.type === type));

    if (mediaPicker) mediaPicker.classList.toggle('hidden', type === 'text');

    if (fileInput) {
      fileInput.value = '';
      fileInput.accept = type === 'image' ? 'image/*' : 'video/*';
    }

    selectedFile = null;
    resetPreview();

    if (type === 'video') {
      textArea.placeholder = 'Write a caption...';
      if (mediaHint) mediaHint.textContent = 'Vertical videos perform best.';
    } else if (type === 'image') {
      textArea.placeholder = 'Write a caption...';
      if (mediaHint) mediaHint.textContent = 'Photos with context get more views.';
    } else {
      textArea.placeholder = "What's on your mind?";
    }
  };

  const onFileChange = () => {
    const file = fileInput?.files?.[0];
    if (!file) return;

    selectedFile = file;
    resetPreview();

    objectUrl = URL.createObjectURL(file);
    if (mediaPreview) mediaPreview.classList.remove('hidden');

    if (postType === 'video' && videoPreview) {
      videoPreview.src = objectUrl;
      videoPreview.classList.remove('hidden');
    }

    if (postType === 'image' && imagePreview) {
      imagePreview.src = objectUrl;
      imagePreview.classList.remove('hidden');
    }
  };

  const onRemoveMedia = () => {
    if (fileInput) fileInput.value = '';
    selectedFile = null;
    resetPreview();
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!navigator.onLine) {
      showToast('You are offline. Please reconnect and try again.', 'warning');
      return;
    }

    const content = textArea.value || '';

    if (postType === 'text') {
      if (!content.trim()) {
        showToast('Write something to post.', 'warning');
        return;
      }
    } else if (!selectedFile) {
      showToast(`Choose a ${postType} file to upload.`, 'warning');
      return;
    }

    submitting = true;
    const prev = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = postType === 'text' ? 'Posting...' : 'Uploading...';

    try {
      let mediaFileId = '';
      if (postType === 'video' || postType === 'image') {
        const up = await uploadPostMedia(selectedFile);
        mediaFileId = up.fileId;
      }

      await createPost({
        authorId: user?.$id,
        postType,
        mediaFileId,
        content,
      });

      textArea.value = '';
      onRemoveMedia();
      showToast('Posted!', 'success');
      trackEvent('post_created', { postType });
      localStorage.removeItem('kalakar_open_composer_once');
      closeComposer();

      // Refresh the feed if we are on Feed
      if ((window.location.hash || '#stage') === '#stage') {
        const stage = await import('../views/stage.js');
        stage.initStageView();
      }
    } catch (error) {
      console.error('Create post failed:', error);
      logError(error, { area: 'post_create' });
      showToast(error?.message || 'Failed to post. Please try again.', 'error');
    } finally {
      submitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = prev;
    }
  };

  typeButtons.forEach((btn) => btn.addEventListener('click', () => setType(btn.dataset.type)));
  fileInput?.addEventListener('change', onFileChange);
  removeMediaBtn?.addEventListener('click', onRemoveMedia);
  submitBtn.addEventListener('click', onSubmit);

  // Default to video-first
  if (isGuestMode()) {
    // Guest mode: keep MVP usable without Appwrite media permissions.
    typeButtons.forEach((b) => {
      const t = b.dataset.type;
      b.classList.toggle('hidden', t !== 'text');
    });
    setType('text');
    showToast('Guest mode: text-only posts.', 'neutral');
  } else {
    setType('video');
  }

  return () => {
    submitBtn.removeEventListener('click', onSubmit);
    fileInput?.removeEventListener('change', onFileChange);
    removeMediaBtn?.removeEventListener('click', onRemoveMedia);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  };
}
