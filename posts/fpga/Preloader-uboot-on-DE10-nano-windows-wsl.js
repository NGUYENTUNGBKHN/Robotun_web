POSTS_DATA.push({
  id: "Preloader-uboot-on-DE10-nano-windows-wsl",
  title: "Update Preloader/U-boot on DE10-Nano using Windows 10 (WSL)",
  excerpt: "Preloader/U-boot in 20.1 or laster for Cyclone V SoC on Windows OS Development Machine",
  date: "2026-03-22",
  author: "RocketBoard",
  tags: ["fpga", "Cyclone-V"],
  content: `## Introduction



This document mentions how to update an older version preloader to a newer version on an existing Linux bootable SD card.
* Older version: 2013.01
* Newer version: 2020.04 or later


What's sfp
- Bootable file: four copies of SPL and one copy on U-Boot image.


## System Requirements


Hardware
- DE10-Nano / FPGA Cloud Connectivity Kit


OS: Windows 10


Software:
- Quartus Prime Standard 20.1- WSL (Windows Subsystem for Linux) version 1


Pre-Requisite


- Make sure you have Ubuntu 18.04 LTS installed from the Microsoft Store
- Making sure you do sudo apt-get install wsl
- sudo apt-get install dos2unix
- sudo apt-get install make
- sudo apt-get install sed wget cvs subversion git coreutils unzip texi2html texinfo libsdl1.2-dev docbook-utils gawk python-pysqlite2 diffstat help2man make gcc build-essential g++ desktop-file-utils chrpath libgl1-mesa-dev libglu1-mesa-dev mercurial autoconf automake groff libtool xterm lib32z1
- sudo apt-get install lib32ncurses-dev lib32z1 lib32stdc++6
- sudo dpkg-reconfigure dash # Select No
- wget https://developer.arm.com/-/media/Files/downloads/gnu-a/10.2-2020.11/binrel/gcc-arm-10.2-2020.11-x86_64-arm-none-linux-gnueabihf.tar.xz
- tar xf gcc-arm-10.2-2020.11-x86_64-arm-none-linux-gnueabihf.tar.xz
- export PATH=\`pwd\`/gcc-arm-10.2-2020.11-x86_64-arm-none-linux-gnueabihf/bin:$PATH
- Go to Folder Path - C:\\intelFPGA_lite\\20.1\\embedded\\host_tools\\python and remove all the content in side the folder
- Download "python-3.9.1-amd64" and install it in the same folder path C:\\intelFPGA\\20.1\\embedded\\host_tools\\python


## How to generate sfp file


Run bsp-create-settings with no user options to convert the handoff data into source code:


\`\`\`c
cd $FPGA_project_directory
mkdir -p software/bootloader
$SOCEDS_EDS_install_path/embedded_command_shell.sh \\
bsp-create-settings \\
   --type spl \\
   --bsp-dir software/bootloader \\
   --preloader-settings-dir "hps_isw_handoff/top_qsys_hps_system_hps_0" \\
   --settings software/bootloader/settings.bsp 
\`\`\`


Example Give



\`\`\`c
cd $working_directory_root/phase1-rfs/hw/Module5_Sample_HW
mkdir -p software/bootloader
~/intelFPGA/20.1/embedded/embedded_command_shell.sh \\
bsp-create-settings \\
   --type spl \\
   --bsp-dir software/bootloader \\
   --preloader-settings-dir "hps_isw_handoff/top_qsys_hps_system_hps_0" \\
   --settings software/bootloader/settings.bsp 
\`\`\`


Refer to U-Boot documentation for more details about the qts-filter script: https://github.com/altera-opensource/u-boot-socfpga/blob/socfpga_v2020.07/doc/README.socfpga


Configure and build U-Boot:


\`\`\`c
cd $FPGA_project_directory/software/bootloader/u-boot-socfpga
export CROSS_COMPILE=arm-none-linux-gnueabihf-
make socfpga_cyclone5_defconfigmake -j 48 
\`\`\`


Example Given


\`\`\`c
cd $working_directory_root/phase1-rfs/hw/Module5_Sample_HW/software/bootloader/u-boot-socfpga
export CROSS_COMPILE=arm-none-linux-gnueabihf-
make socfpga_cyclone5_defconfig
make -j 48 
\`\`\`


If your SD card image configure FPGA image(.rbf) in u-boot before Linux kernel boot(this is most of case), you need update uboot.scr as well. Generate a text script to load and configure RBF image, then convert the text into a dedicated file format which u-boot can load, and copy the file to the sd card partition.


\`\`\`c
cd $FPGA_project_directory/software/bootloader/u-boot-socfpga
echo "fatload mmc 0:1 \\$loadaddr $your_rbf_file;" > u-boot.txt
echo "fpga load 0 \\$loadaddr \\$filesize;" >> u-boot.txt
tools/mkimage -A arm -O linux -T script -C none -a 0 -e 0 -n "FPGA_config" -d u-boot.txt u-boot.scr 
\`\`\`


Example Given


\`\`\`c
cd $working_directory_root/phase1-rfs/hw/Module5_Sample_HW/software/bootloader/u-boot-socfpga
echo "fatload mmc 0:1 \\$loadaddr output_files/DE10_NANO_SOC_FB.rbf;" > u-boot.txt
echo "fpga load 0 \\$loadaddr \\$filesize;" >> u-boot.txt
tools/mkimage -A arm -O linux -T script -C none -a 0 -e 0 -n "FPGA_config" -d u-boot.txt u-boot.scr 
\`\`\`


The following files will be built in the $working_directory_root/phase1-rfs/hw/Module5_Sample_HW/software/bootloader/u-boot-socfpga folder:




| File | Description |
| --- | --- |
| spl/u-boot-spl | SPL ELF executable |
| u-boot.scr | u-boot script |


| u-boot | U-Boot ELF executable |


| u-boot-with-spl.sfp | Bootable file: four copies of SPL and one copy on U-Boot image |


## How to update bootloader on your SD card


This section presents how to update SD card files. In this example, we work on Cyclone V SoC(DE10-Nano) Linux and re-write the SD card contents which is booting the Linux. It's recommended to backup your SD card image before the work.


In general, we need to the following steps:
- Transfer files to DE10-Nano from your PC
- Update u-boot.scr on FAT partition
- Create extlinux/extlinux.conf on FAT partition
- (Optional) Update .rbf file, if needed.


In the following section, we use a specific SD card image to show concrete command examples. The SD card image targeted is "SD Card Image for AWS IoT Greengrass" in this link: [https://www.terasic.com.tw/cgi-bin/page/archive.pl?Language=English&CategoryNo=167&No=1046&PartNo=4](https://www.terasic.com.tw/cgi-bin/page/archive.pl?Language=English&CategoryNo=167&No=1046&PartNo=4)


The following files are generated from Quartus and previous step:










| File | Description |
| --- | --- |
| module5_Sample_HW.rbf | FPGA rbf bistream |
| u-boot.scr | u-boot script |
| u-boot-with--spl.sfp | Bootable file: four copies of SPL and one copy on U-Boot image |


1) Send the file from development PC to DE10-Nano. Open a development PC's terminal.How to check IP ADdress on DE10-NanoInput(on DE10-Nano)


\`\`\`c
ip addr
\`\`\`


Exmaple output:



\`\`\`c
2: eth0:  mtu 1500 qdisc mq state UP group default qlen 1000     link/ether f2:36:44:ac:08:7b brd ff:ff:ff:ff:ff:ff
     inet 192.168.100.145/24 brd 192.168.100.255 scope global dynamic eth0
     valid_lft 600184sec preferred_lft 600184sec 
\`\`\`


In our case, the address is "192.168.100.145".Below shows example on sending file to the DE10-Nano boards. (On the development PC)


\`\`\`c
scp $working_directory_root/phase1-rfs/hw/Module5_Sample_HW/Module5_Sample_HW.rbf root@192.168.100.145:~/Downloads/
scp u-boot.scr root@192.168.100.145:~/Downloads/
scp u-boot-with-spl.sfp root@192.168.100.145:~/Downloads/ 
\`\`\`


2) Update SDCard file and Reboot. (On DE10-Nano)


\`\`\`c
dd if=~/Download/u-boot-with-spl.sfp of=/dev/mmcblk0p3


sudo mount /dev/mmcblk0p1 /mnt
cd /mnt


cp ~/Download/u-boot.scr u-boot.scr


mkdir extlinux
echo "LABEL Linux Default" > extlinux/extlinux.conf
echo "    KERNEL ../zImage" >> extlinux/extlinux.conf
echo "    FDT ../soc_system.dtb" >> extlinux/extlinux.conf
echo "    APPEND root=/dev/mmcblk0p2 rw rootwait earlyprintk console=ttyS0,115200n8" >> extlinux/extlinux.conf


cp ~/Download/Module5_Sample_HW.rbf output_files/DE10_NANO_SOC_FB.rbf
sync
umount /mnt
reboot 
\`\`\`
## Reference Links
[https://rocketboards.org/foswiki/Documentation/UpdatePreloaderUBootIn201OrLaterForCycloneV#Introduction](https://rocketboards.org/foswiki/Documentation/UpdatePreloaderUBootIn201OrLaterForCycloneV#Introduction https://malt.zendesk.com/hc/ja/articles/900006257943-WSL-%E3%81%A7-Preloader-U-Boot-%E3%82%92%E3%83%93%E3%83%AB%E3%83%89%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B-%E3%81%9D%E3%81%AE-2-%E3%83%93%E3%83%AB%E3%83%89%E7%B7%A8 https://www.reddit.com/r/FPGA/comments/l4wrbv/nioseclipse_error_when_trying_to_make_nios2_with/) [https://malt.zendesk.com/hc/ja/articles/900006257943-WSL-%E3%81%A7-Preloader-U-Boot-%E3%82%92%E3%83%93%E3%83%AB%E3%83%89%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B-%E3%81%9D%E3%81%AE-2-%E3%83%93%E3%83%AB%E3%83%89%E7%B7%A8](https://malt.zendesk.com/hc/ja/articles/900006257943-WSL-%E3%81%A7-Preloader-U-Boot-%E3%82%92%E3%83%93%E3%83%AB%E3%83%89%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B-%E3%81%9D%E3%81%AE-2-%E3%83%93%E3%83%AB%E3%83%89%E7%B7%A8) [https://www.reddit.com/r/FPGA/comments/l4wrbv/nioseclipse_error_when_trying_to_make_nios2_with/](https://www.reddit.com/r/FPGA/comments/l4wrbv/nioseclipse_error_when_trying_to_make_nios2_with/)`
});
