import subprocess
import json
import re
from datetime import datetime

class RealTimeCapture:
    def __init__(self):
        self.tshark_path = r"C:\Program Files\Wireshark\tshark.exe"
        self.running = False
        
    def get_interfaces(self):
        """Get available network interfaces"""
        try:
            result = subprocess.run([self.tshark_path, "-D"], capture_output=True, text=True)
            interfaces = []
            for line in result.stdout.split('\n'):
                if line.strip():
                    # Extract interface name like "Wi-Fi" from "5. \Device\NPF_{...} (Wi-Fi)"
                    match = re.search(r'\((.+?)\)', line)
                    if match and match.group(1) not in ['Local Area Connection', 'Bluetooth', 'Loopback']:
                        interfaces.append(match.group(1))
            return interfaces if interfaces else ["Wi-Fi"]
        except:
            return ["Wi-Fi"]
    
    def start_capture(self, interface="Wi-Fi", packet_limit=10):
        """Capture live packets using tshark"""
        # Find interface number
        try:
            result = subprocess.run([self.tshark_path, "-D"], capture_output=True, text=True)
            interface_num = None
            for line in result.stdout.split('\n'):
                if f"({interface})" in line:
                    interface_num = line.split('.')[0].strip()
                    break
            
            if not interface_num:
                interface_num = "5"  # Default to Wi-Fi
            
            # Start capture
            cmd = [self.tshark_path, "-i", interface_num, "-c", str(packet_limit), "-T", "json"]
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            packet_count = 0
            output_lines = []
            
            for line in process.stdout:
                output_lines.append(line)
                if line.strip().startswith('[') or line.strip().startswith('{'):
                    packet_count += 1
                    # Parse packet data
                    try:
                        packet_data = self.parse_packet(line)
                        if packet_data:
                            yield packet_data
                    except:
                        pass
                    
            process.terminate()
            
        except Exception as e:
            print(f"Capture error: {e}")
            yield None
    
    def parse_packet(self, line):
        """Parse tshark JSON output into dict"""
        try:
            # Extract basic info using regex (simpler than full JSON parsing)
            src_match = re.search(r'"ip.src":\s*"([^"]+)"', line)
            dst_match = re.search(r'"ip.dst":\s*"([^"]+)"', line)
            proto_match = re.search(r'"ip.proto":\s*"([^"]+)"', line)
            length_match = re.search(r'"frame.len":\s*"([^"]+)"', line)
            
            return {
                "timestamp": datetime.now().isoformat(),
                "src_ip": src_match.group(1) if src_match else "Unknown",
                "dst_ip": dst_match.group(1) if dst_match else "Unknown",
                "protocol": "TCP" if proto_match and proto_match.group(1) == "6" else "UDP",
                "length": int(length_match.group(1)) if length_match else 64,
            }
        except:
            return None