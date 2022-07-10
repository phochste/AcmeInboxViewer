<script>
    import { closeModal } from 'svelte-modals'
      
    export let isOpen
    export let title
    export let message
      
  </script>
  
  {#if isOpen}
    <div role="dialog" class="modal">
      <div class="contents">
        <h2>{title}</h2>
        <div class="container">
            {@html message}
        </div>
        <div class="actions">
           <button on:click={closeModal}>Close</button>
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .modal {
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
  
      /* allow click-through to backdrop */
      pointer-events: none;
    }

    .container {
        width: 800px;
        height: 400px;
        overflow: auto;
    }
  
    .contents {
      min-width: 240px;
      border-radius: 6px;
      padding: 16px;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: auto;
    }
  
    h2 {
      text-align: center;
      font-size: 24px;
    }
  
    .actions {
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
          gap: 8px;
    }
  
  </style>