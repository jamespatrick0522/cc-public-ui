<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { MessageCircleMore, RefreshCw } from 'lucide-vue-next';

import { getGuestThread, sendGuestMessage } from '@/api/messages.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GuestIdentity, GuestMessageItem } from '@/types/api';

const props = defineProps<{
  establishmentId: string;
  establishmentName: string;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const identity = reactive<GuestIdentity>({
  fullName: '',
  email: '',
  phone: '',
});
const messageText = ref('');
const sending = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const thread = ref<GuestMessageItem[]>([]);
const conversationToken = ref<string | null>(null);
const threadContainer = ref<HTMLElement | null>(null);
const isTouchDevice = ref(false);
let pollHandle: number | null = null;

const storageKey = computed(() => `city-connect-guest-thread:${props.establishmentId}`);
const hasStartedThread = computed(() => Boolean(conversationToken.value));
const identityLocked = computed(() => hasStartedThread.value);

function detectTouchDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

async function scrollToLatest() {
  await nextTick();

  if (!threadContainer.value) {
    return;
  }

  threadContainer.value.scrollTop = threadContainer.value.scrollHeight;
}

function restoreSession() {
  const raw = localStorage.getItem(storageKey.value);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as {
      conversationToken: string;
      identity: GuestIdentity;
    };

    conversationToken.value = parsed.conversationToken;
    identity.fullName = parsed.identity.fullName;
    identity.email = parsed.identity.email || '';
    identity.phone = parsed.identity.phone || '';
  } catch {
    localStorage.removeItem(storageKey.value);
  }
}

function persistSession() {
  if (!conversationToken.value) {
    return;
  }

  localStorage.setItem(
    storageKey.value,
    JSON.stringify({
      conversationToken: conversationToken.value,
      identity: {
        fullName: identity.fullName,
        email: identity.email || undefined,
        phone: identity.phone || undefined,
      },
    }),
  );
}

async function refreshThread(options: { silent?: boolean } = {}) {
  if (!conversationToken.value) {
    return;
  }

  if (!options.silent) {
    loading.value = true;
  }

  try {
    const response = await getGuestThread({ conversationToken: conversationToken.value, page: 1, pageSize: 100 });
    thread.value = response.data;
    errorMessage.value = '';
    await scrollToLatest();
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Unable to refresh this inquiry thread.';
  } finally {
    if (!options.silent) {
      loading.value = false;
    }
  }
}

function startPolling() {
  stopPolling();
  pollHandle = window.setInterval(() => {
    void refreshThread({ silent: true });
  }, 5000);
}

function stopPolling() {
  if (pollHandle !== null) {
    window.clearInterval(pollHandle);
    pollHandle = null;
  }
}

async function sendMessage() {
  errorMessage.value = '';

  if (!identity.fullName.trim()) {
    errorMessage.value = 'Please enter your full name.';
    return;
  }

  if (!identity.email?.trim() && !identity.phone?.trim()) {
    errorMessage.value = 'Please provide an email or phone number.';
    return;
  }

  if (!messageText.value.trim()) {
    errorMessage.value = 'Please type your message.';
    return;
  }

  sending.value = true;

  try {
    const response = await sendGuestMessage({
      establishmentId: props.establishmentId,
      fullName: identity.fullName.trim(),
      email: identity.email?.trim() || undefined,
      phone: identity.phone?.trim() || undefined,
      message: messageText.value.trim(),
      clientRequestId: crypto.randomUUID(),
    });

    conversationToken.value = response.conversationToken;
    persistSession();
    messageText.value = '';
    await refreshThread({ silent: true });
    startPolling();
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to send your inquiry.';
  } finally {
    sending.value = false;
  }
}

function handleMessageKeydown(event: KeyboardEvent) {
  if (isTouchDevice.value) {
    return;
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();

    if (!sending.value) {
      void sendMessage();
    }
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      restoreSession();
      if (conversationToken.value) {
        await refreshThread();
        startPolling();
      }
    } else {
      stopPolling();
    }
  },
  { immediate: true },
);

watch(
  () => props.establishmentId,
  async () => {
    conversationToken.value = null;
    thread.value = [];
    errorMessage.value = '';
    messageText.value = '';
    identity.fullName = '';
    identity.email = '';
    identity.phone = '';
    restoreSession();

    if (props.open && conversationToken.value) {
      await refreshThread();
      startPolling();
    }
  },
);

onMounted(() => {
  isTouchDevice.value = detectTouchDevice();
  restoreSession();
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 md:items-center md:px-4 md:py-8">
    <div class="flex h-[88vh] w-full max-w-2xl flex-col rounded-t-3xl border bg-card shadow-2xl md:h-[80vh] md:rounded-3xl">
      <div class="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h3 class="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <MessageCircleMore class="h-5 w-5 text-secondary" />
            Chat with {{ establishmentName }}
          </h3>
          <p class="mt-1 text-sm text-muted-foreground">Replies refresh automatically every 5 seconds.</p>
        </div>
        <Button variant="ghost" size="sm" @click="emit('close')">Close</Button>
      </div>

      <div class="flex-1 overflow-y-auto px-5 py-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label>Full name</Label>
            <Input
              v-model="identity.fullName"
              class="h-11"
              placeholder="Juan Dela Cruz"
              :readonly="identityLocked"
            />
          </div>
          <div class="space-y-2">
            <Label>Email</Label>
            <Input
              v-model="identity.email"
              type="email"
              class="h-11"
              placeholder="Optional if phone is provided"
              :readonly="identityLocked"
            />
          </div>
          <div class="space-y-2 md:col-span-2">
            <Label>Phone</Label>
            <Input
              v-model="identity.phone"
              class="h-11"
              placeholder="Optional if email is provided"
              :readonly="identityLocked"
            />
          </div>
        </div>
        <p v-if="identityLocked" class="mt-3 text-xs text-muted-foreground">
          Your guest identity is locked for this establishment so you can continue the same conversation.
        </p>

        <div class="mt-5 rounded-3xl border bg-background p-4">
          <div class="mb-3 flex items-center justify-between">
            <p class="font-medium text-foreground">Conversation</p>
            <Button variant="ghost" size="sm" class="h-9" @click="refreshThread">
              <RefreshCw class="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div ref="threadContainer" class="max-h-[320px] space-y-3 overflow-y-auto">
            <div v-if="loading" class="text-sm text-muted-foreground">Refreshing messages...</div>
            <div v-else-if="!thread.length" class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">No messages yet. Start your inquiry below.</div>

            <div v-for="item in thread" :key="item.id" class="max-w-[85%] rounded-2xl px-4 py-3 text-sm" :class="item.senderRole === 'tourist' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted text-foreground'">
              <p class="whitespace-pre-wrap">{{ item.message }}</p>
              <p class="mt-1 text-[11px] opacity-80">{{ new Date(item.createdAt).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t px-5 py-4">
        <Textarea
          v-model="messageText"
          class="min-h-[110px]"
          placeholder="Type your inquiry here..."
          @keydown="handleMessageKeydown"
        />
        <p v-if="errorMessage" class="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{{ errorMessage }}</p>
        <div class="mt-4 flex items-center justify-between gap-3">
          <p class="text-xs text-muted-foreground">
            {{ hasStartedThread ? 'Your previous inquiry thread is active.' : 'You can chat as a guest.' }}
            <span v-if="!isTouchDevice" class="block">Press Enter to send. Use Shift + Enter for a new line.</span>
          </p>
          <Button class="h-11" :disabled="sending" @click="sendMessage">
            {{ sending ? 'Sending...' : hasStartedThread ? 'Send message' : 'Start inquiry' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

