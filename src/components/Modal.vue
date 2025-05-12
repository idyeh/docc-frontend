<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
        <p class="mb-6">{{ message }}</p>
        <div class="text-right space-x-2">
          <button @click="$emit('cancel')" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button @click="$emit('confirm')" class="px-4 py-2 bg-red-600 text-white rounded">OK</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: 'Confirm' },
    message: { type: String, default: '' }
  },
  emits: ['confirm', 'cancel']
}
</script>
