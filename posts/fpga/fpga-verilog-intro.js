POSTS_DATA.push({
  id: "fpga-verilog-intro",
  title: "FPGA Verilog Introduction",
  excerpt: "Getting started with Verilog HDL for FPGA design - master modules, ports, wires, registers and always blocks",
  date: "2026-03-12",
  author: "RoboTun Team",
  tags: ["fpga", "verilog", "hdl", "rtl", "vivado", "xilinx", "digital-design"],
  content: `## What is Verilog?

**Verilog** (IEEE 1364) is a Hardware Description Language (HDL) used to design and simulate digital circuits. Unlike C/Python which runs sequentially, Verilog describes hardware that runs in **true parallel**.

## Basic Structure: Module

Every Verilog design is a **module** — the basic unit like an IC chip.

\`\`\`verilog
module led_blink (
    input  wire clk,      // 100 MHz clock
    input  wire rst_n,    // active-low reset
    output reg  led       // LED output
);

    // Count to 50M → toggle LED every 0.5 seconds
    reg [25:0] counter;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            counter <= 26'd0;
            led     <= 1'b0;
        end else if (counter == 26'd49_999_999) begin
            counter <= 26'd0;
            led     <= ~led;
        end else begin
            counter <= counter + 1'b1;
        end
    end

endmodule
\`\`\`

## Key Data Types

| Type | Purpose | Use |
|------|---------|-----|
| \`wire\` | Continuous connection, no state | Module connections |
| \`reg\` | Register, holds value | Inside \`always\` blocks |
| \`integer\` | Số nguyên 32-bit (chỉ mô phỏng) | Vòng lặp trong testbench |
| \`parameter\` | Hằng số | Cấu hình module |

\`\`\`verilog
wire [7:0]  data_bus;    // bus 8-bit dây
reg  [15:0] shift_reg;   // thanh ghi dịch 16-bit
parameter CLK_FREQ = 100_000_000;
\`\`\`

---

## Mạch tổ hợp (Combinational Logic)

Dùng \`assign\` hoặc \`always @(*)\`:

\`\`\`verilog
// Cách 1: assign — continuous assignment
assign y = a & b | c;

// Cách 2: always với sensitivity list *
always @(*) begin
    case (sel)
        2'b00: out = a;
        2'b01: out = b;
        2'b10: out = c;
        default: out = 4'b0;
    endcase
end
\`\`\`

> **Quan trọng**: Trong \`always @(*)\`, dùng \`=\` (blocking assignment) cho mạch tổ hợp.

---

## Mạch tuần tự (Sequential Logic)

Luôn dùng \`always @(posedge clk)\` và **non-blocking assignment** \`<=\`:

\`\`\`verilog
module d_flipflop (
    input  wire clk, rst_n, d,
    output reg  q
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule
\`\`\`

---

## UART TX đơn giản

\`\`\`verilog
module uart_tx #(
    parameter CLK_FREQ = 100_000_000,
    parameter BAUD     = 115200
) (
    input  wire       clk, rst_n,
    input  wire [7:0] data,
    input  wire       valid,
    output reg        tx,
    output reg        busy
);
    localparam BAUD_DIV = CLK_FREQ / BAUD;  // = 868

    reg [9:0]  shift;      // start + 8 data + stop
    reg [9:0]  bit_cnt;    // clock per bit counter
    reg [3:0]  bit_idx;    // bit index 0..9

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            tx      <= 1'b1;
            busy    <= 1'b0;
            bit_cnt <= 0;
            bit_idx <= 0;
        end else if (!busy && valid) begin
            shift   <= {1'b1, data, 1'b0}; // stop, data[7:0], start
            busy    <= 1'b1;
            bit_cnt <= 0;
            bit_idx <= 0;
        end else if (busy) begin
            if (bit_cnt == BAUD_DIV - 1) begin
                bit_cnt <= 0;
                tx      <= shift[bit_idx];
                if (bit_idx == 9)
                    busy <= 1'b0;
                else
                    bit_idx <= bit_idx + 1'b1;
            end else begin
                bit_cnt <= bit_cnt + 1'b1;
            end
        end
    end
endmodule
\`\`\`

---

## Testbench — Mô phỏng

\`\`\`verilog
\`timescale 1ns/1ps

module tb_led_blink;
    reg  clk   = 0;
    reg  rst_n = 0;
    wire led;

    led_blink dut (
        .clk   (clk),
        .rst_n (rst_n),
        .led   (led)
    );

    // Clock 100 MHz → chu kỳ 10 ns
    always #5 clk = ~clk;

    initial begin
        $dumpfile("tb.vcd");
        $dumpvars(0, tb_led_blink);
        #20 rst_n = 1;
        #200_000_000;  // chạy 200 ms
        $finish;
    end
endmodule
\`\`\`

---

## Quy tắc vàng

- **\`<=\`** (non-blocking) → mạch tuần tự (\`always @(posedge clk)\`)
- **\`=\`** (blocking) → mạch tổ hợp (\`always @(*)\`) hoặc testbench
- Luôn có **reset đồng bộ/bất đồng bộ** cho flip-flop
- Tránh **latch** bằng cách liệt kê đủ nhánh \`default\` trong \`case\`
- Dùng **\`parameter\`** thay số magic để dễ tái sử dụng`
});
