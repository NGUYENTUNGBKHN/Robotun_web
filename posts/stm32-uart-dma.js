POSTS_DATA.push({
  id: "stm32-uart-dma",
  title: "STM32 UART với DMA — Không cần polling",
  excerpt: "Tận dụng DMA để nhận UART không chặn CPU, xử lý dữ liệu serial hiệu quả trên STM32F4 với HAL library.",
  date: "2024-04-05",
  author: "Author",
  tags: ["stm32", "mcu", "uart", "dma", "hal", "firmware"],
  content: `## Tại sao cần DMA cho UART?

Khi dùng \`HAL_UART_Receive()\` blocking, CPU phải ngồi chờ từng byte. Với DMA, CPU được giải phóng — DMA tự chuyển data từ UART vào RAM.

---

## Cấu hình trong CubeMX

1. USART1 → Mode: **Asynchronous**
2. DMA Settings → Add → **USART1_RX** → Mode: **Circular**
3. NVIC: Enable **USART1 global interrupt**

---

## Code với Idle Line Detection

\`\`\`c
#define RX_BUF_SIZE  256

uint8_t rx_buf[RX_BUF_SIZE];
uint8_t proc_buf[RX_BUF_SIZE];
uint16_t rx_len = 0;

void UART_Start(void) {
    __HAL_UART_ENABLE_IT(&huart1, UART_IT_IDLE);
    HAL_UART_Receive_DMA(&huart1, rx_buf, RX_BUF_SIZE);
}

void USART1_IRQHandler(void) {
    if (__HAL_UART_GET_FLAG(&huart1, UART_FLAG_IDLE)) {
        __HAL_UART_CLEAR_IDLEFLAG(&huart1);

        rx_len = RX_BUF_SIZE -
                 __HAL_DMA_GET_COUNTER(huart1.hdmarx);

        memcpy(proc_buf, rx_buf, rx_len);

        BaseType_t xHigherPriorityTaskWoken = pdFALSE;
        vTaskNotifyGiveFromISR(uart_task_handle,
                               &xHigherPriorityTaskWoken);
        portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
    }
    HAL_UART_IRQHandler(&huart1);
}
\`\`\`

---

## FreeRTOS Task xử lý data

\`\`\`c
void UartTask(void *arg) {
    for (;;) {
        ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
        parse_command(proc_buf, rx_len);
    }
}
\`\`\`

> **Pitfall**: Với DMA Circular buffer đầy sẽ wrap around — cần tính \`rx_len\` dựa trên write pointer thực tế.`
});
