// Measured on real VMs, smolvm v1.33.0 release on darwin-arm64: stock agent, then
// the patched agent swapped into a copy of agent-rootfs. Each command prints 20 MB
// unless the label says otherwise.
const error = "command output exceeded 11534336 bytes and was truncated";

export const imageRuns = [
  {
    command: `(head -c 20000000 /dev/zero | tr "\\0" a; echo finished > /tmp/done); true`,
    before: { exit: "0", stdout: "11,541,500", stderr: "empty" },
    after: { exit: "1", stdout: "0", stderr: error },
  },
  {
    command: `head -c 20000000 /dev/zero | tr "\\0" a; exit 7`,
    before: { exit: "7", stdout: "11,536,375", stderr: "empty" },
    after: { exit: "1", stdout: "0", stderr: error },
  },
  {
    command: `head -c 20000000 /dev/zero | tr "\\0" a > /tmp/f; cat /tmp/f`,
    before: { exit: "141", stdout: "11,534,336", stderr: "empty" },
    after: { exit: "1", stdout: "0", stderr: error },
  },
];

export const unchangedRuns = [
  { command: "--image, 5 MB, exit 7", result: "exit 7, 5,000,000 bytes" },
  { command: "--image, exactly 11,534,336 bytes, exit 7", result: "exit 7, 11,534,336 bytes" },
  { command: "--image --stream, 20 MB", result: "exit 1, clear error (already)" },
  { command: "no image, 20 MB", result: "exit 1, clear error (already)" },
];
