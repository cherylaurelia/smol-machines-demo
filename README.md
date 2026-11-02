# smolvm exec truncation on image machines

Unofficial demo by Cheryl Aurelia: not affiliated with smol machines.

## The problem
On a machine created with `--image`, `machine exec` past the 11 MiB per-stream cap returns partial stdout and empty stderr. The exit code depends on what the script does next: measured 141, the script's own 7, and 0. No-image machines and `--stream` already return a clear error, added in https://github.com/smol-machines/smolvm/pull/357.

Found by running v1.33.0 on darwin-arm64. No user has reported it, and how often callers reach the cap is unknown.

## What the page does
Shows the measured before and after, what does not change, the cause, and the limits. The patch is at https://github.com/smol-machines/smolvm/compare/main...cherylaurelia:smolvm:fix/image-exec-output-cap.

## Run it
```
npm install
npm run dev
```
