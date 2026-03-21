POSTS_DATA.push({
  id: "fpga-vhdl-intro",
  title: "FPGA VHDL Introduction",
  excerpt: "Master VHDL hardware description - entity/architecture, std_logic types, processes and signals for professional FPGA design",
  date: "2026-03-10",
  author: "RoboTun Team",
  tags: ["fpga", "vhdl", "hdl", "rtl", "vivado", "quartus", "digital-design"],
  content: `## What is VHDL?

**VHDL** (VHSIC Hardware Description Language — IEEE 1076) is a hardware description language developed by the US Department of Defense. VHDL is known for **strong type safety** and is widely used in industry, especially for applications requiring high reliability.

## Entity and Architecture

A VHDL design consists of two required parts:

- **Entity**: declares the interface (ports in/out)
- **Architecture**: describes internal behavior

\`\`\`vhdl
-- Standard libraries to import
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

-- Entity: module interface
entity led_blink is
    Generic (
        CLK_FREQ : integer := 100_000_000  -- 100 MHz
    );
    Port (
        clk   : in  STD_LOGIC;
        rst_n : in  STD_LOGIC;
        led   : out STD_LOGIC
    );
end entity led_blink;

-- Architecture: functional description
architecture RTL of led_blink is
    signal counter : unsigned(25 downto 0) := (others => '0');
begin

    process(clk, rst_n)
    begin
        if rst_n = '0' then
            counter <= (others => '0');
            led     <= '0';
        elsif rising_edge(clk) then
            if counter = to_unsigned(CLK_FREQ/2 - 1, 26) then
                counter <= (others => '0');
                led     <= not led;
            else
                counter <= counter + 1;
            end if;
        end if;
    end process;

end architecture RTL;
\`\`\`

---

## Kiểu dữ liệu STD_LOGIC

VHDL dùng \`STD_LOGIC\` thay vì chỉ \`0/1\` — hỗ trợ 9 giá trị:

| Giá trị | Ý nghĩa |
|---------|---------|
| \`'0'\` | Mức thấp (logic 0) |
| \`'1'\` | Mức cao (logic 1) |
| \`'Z'\` | High-impedance (tri-state) |
| \`'X'\` | Unknown (mô phỏng) |
| \`'U'\` | Uninitialized |

\`\`\`vhdl
signal data    : STD_LOGIC;                    -- 1 bit
signal bus8    : STD_LOGIC_VECTOR(7 downto 0); -- 8-bit vector
signal count   : unsigned(15 downto 0);        -- số không dấu
signal signed_val : signed(7 downto 0);        -- số có dấu
\`\`\`

---

## Process — Trái tim của VHDL

\`process\` trong VHDL tương tự \`always\` trong Verilog:

\`\`\`vhdl
-- Mạch tổ hợp: sensitivity list gồm TẤT CẢ input
process(a, b, sel)
begin
    case sel is
        when "00"   => output <= a and b;
        when "01"   => output <= a or  b;
        when "10"   => output <= a xor b;
        when others => output <= '0';
    end case;
end process;

-- Mạch tuần tự: chỉ cần clk (và rst nếu async)
process(clk)
begin
    if rising_edge(clk) then
        q <= d;
    end if;
end process;
\`\`\`

---

## UART RX trong VHDL

\`\`\`vhdl
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity uart_rx is
    Generic (
        CLK_FREQ : integer := 100_000_000;
        BAUD     : integer := 115_200
    );
    Port (
        clk      : in  STD_LOGIC;
        rst_n    : in  STD_LOGIC;
        rx       : in  STD_LOGIC;
        data_out : out STD_LOGIC_VECTOR(7 downto 0);
        valid    : out STD_LOGIC
    );
end entity uart_rx;

architecture RTL of uart_rx is
    constant BAUD_DIV    : integer := CLK_FREQ / BAUD;
    constant HALF_BAUD   : integer := BAUD_DIV / 2;

    type state_t is (IDLE, START, DATA, STOP);
    signal state    : state_t := IDLE;
    signal baud_cnt : integer range 0 to BAUD_DIV := 0;
    signal bit_idx  : integer range 0 to 7        := 0;
    signal shift    : STD_LOGIC_VECTOR(7 downto 0) := (others => '0');
begin

    process(clk, rst_n)
    begin
        if rst_n = '0' then
            state    <= IDLE;
            valid    <= '0';
            baud_cnt <= 0;
            bit_idx  <= 0;

        elsif rising_edge(clk) then
            valid <= '0';

            case state is
                when IDLE =>
                    if rx = '0' then  -- phát hiện start bit
                        baud_cnt <= 0;
                        state    <= START;
                    end if;

                when START =>
                    if baud_cnt = HALF_BAUD - 1 then
                        baud_cnt <= 0;
                        bit_idx  <= 0;
                        state    <= DATA;
                    else
                        baud_cnt <= baud_cnt + 1;
                    end if;

                when DATA =>
                    if baud_cnt = BAUD_DIV - 1 then
                        baud_cnt        <= 0;
                        shift(bit_idx)  <= rx;
                        if bit_idx = 7 then
                            state <= STOP;
                        else
                            bit_idx <= bit_idx + 1;
                        end if;
                    else
                        baud_cnt <= baud_cnt + 1;
                    end if;

                when STOP =>
                    if baud_cnt = BAUD_DIV - 1 then
                        baud_cnt <= 0;
                        data_out <= shift;
                        valid    <= '1';
                        state    <= IDLE;
                    else
                        baud_cnt <= baud_cnt + 1;
                    end if;
            end case;
        end if;
    end process;

end architecture RTL;
\`\`\`

---

## Testbench VHDL

\`\`\`vhdl
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity tb_led_blink is
end entity tb_led_blink;

architecture sim of tb_led_blink is

    signal clk   : STD_LOGIC := '0';
    signal rst_n : STD_LOGIC := '0';
    signal led   : STD_LOGIC;

begin
    -- Instantiate DUT
    dut : entity work.led_blink
        generic map (CLK_FREQ => 100)  -- dùng CLK_FREQ nhỏ để sim nhanh
        port map (
            clk   => clk,
            rst_n => rst_n,
            led   => led
        );

    -- Clock 100 MHz → 10 ns period
    clk <= not clk after 5 ns;

    -- Stimulus
    process
    begin
        wait for 20 ns;
        rst_n <= '1';
        wait for 10 us;
        assert false report "Simulation done" severity failure;
    end process;

end architecture sim;
\`\`\`

---

## So sánh VHDL vs Verilog

| Tiêu chí | VHDL | Verilog |
|----------|------|---------|
| Cú pháp | Verbose, chặt chẽ | Ngắn gọn, gần C |
| Kiểu dữ liệu | Mạnh — phát hiện lỗi sớm | Yếu hơn |
| Phổ biến | Châu Âu, quân sự, hàng không | Mỹ, Silicon Valley |
| Mô phỏng | ModelSim, GHDL | Icarus, VCS |
| EDA tool | Vivado, Quartus | Vivado, Quartus |

> **Lời khuyên**: Học cả hai — VHDL cho độ chính xác, Verilog/SystemVerilog cho tốc độ phát triển.`
});
