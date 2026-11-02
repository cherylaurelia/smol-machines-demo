import { imageRuns, unchangedRuns } from "./runs";

const patchUrl =
  "https://github.com/smol-machines/smolvm/compare/main...cherylaurelia:smolvm:fix/image-exec-output-cap";

const repoUrl = "https://github.com/cherylaurelia/smol-machines-demo";
const pr357 = "https://github.com/smol-machines/smolvm/pull/357";

function Mono({ text }: { text: string }) {
  return <code className="rounded bg-code px-1 py-0.5 font-mono text-[13px] break-words">{text}</code>;
}

function Result({
  label,
  tone,
  run,
}: {
  label: string;
  tone: string;
  run: { exit: string; stdout: string; stderr: string };
}) {
  return (
    <div className="min-w-0 border-t border-line p-4 sm:border-t-0 sm:border-l">
      <p className={`text-xs font-medium ${tone}`}>{label}</p>
      <dl className="mt-2 grid grid-cols-[4rem_1fr] gap-y-1 font-mono text-[13px]">
        <dt className="text-muted">exit</dt>
        <dd>{run.exit}</dd>
        <dt className="text-muted">stdout</dt>
        <dd>{run.stdout === "0" ? "0 bytes" : `${run.stdout} bytes`}</dd>
        <dt className="text-muted">stderr</dt>
        <dd className="break-words">{run.stderr}</dd>
      </dl>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <p className="text-center text-sm text-muted">smolvm · machine exec · v1.33.0</p>
      <h1 className="mt-4 text-center text-3xl leading-tight font-semibold sm:text-4xl">
        Past 11 MiB, exec on an image machine returns partial output with no error.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-center leading-7 text-muted">
        This patch returns the clear error that no-image machines and <Mono text="--stream" /> already give.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        <a className="rounded border border-ink bg-ink px-4 py-2 text-white hover:bg-[#333333]" href={patchUrl}>
          See the patch
        </a>
        <a className="rounded border border-line px-4 py-2 hover:bg-code" href={repoUrl}>
          Demo repo
        </a>
      </div>

      <section aria-labelledby="runs" className="mt-12 border-t border-line pt-8">
        <h2 id="runs" className="font-semibold">
          20 MB of output on a machine created with <span className="whitespace-nowrap font-mono">--image</span>
        </h2>
        <p className="mt-2 leading-7 text-muted">
          The exit code depends on what the script does next, so a caller can see a success with about 8 MB missing.
        </p>
        <div className="mt-4 space-y-4">
          {imageRuns.map((run) => (
            <article key={run.command} className="overflow-hidden rounded border border-line">
              <p className="border-b border-line bg-code px-4 py-2 font-mono text-[13px] break-words">
                smolvm machine exec --name img -- sh -c &apos;{run.command}&apos;
              </p>
              <div className="grid sm:grid-cols-2 sm:[&>*:first-child]:border-l-0">
                <Result label="v1.33.0" tone="text-bad" run={run.before} />
                <Result label="with the patch" tone="text-good" run={run.after} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="same" className="mt-10 border-t border-line pt-8">
        <h2 id="same" className="font-semibold">
          Same before and after
        </h2>
        <ul className="mt-3 divide-y divide-line rounded border border-line text-sm">
          {unchangedRuns.map((run) => (
            <li key={run.command} className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-4 py-2.5">
              <span>{run.command}</span>
              <span className="font-mono text-[13px] text-muted">{run.result}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="why" className="mt-10 border-t border-line pt-8">
        <h2 id="why" className="font-semibold">
          Why it happens
        </h2>
        <p className="mt-2 leading-7">
          <a className="underline underline-offset-2" href={pr357}>
            PR #357
          </a>{" "}
          added the clear error to the no-image path. On the container path, readers stop at{" "}
          <Mono text="MAX_EXEC_OUTPUT" /> and close the pipe, and <Mono text="cap_exec_response" /> only checks a 20 MiB
          combined budget, which one stream at 11 MiB cannot reach.
        </p>
      </section>

      <section aria-labelledby="limits" className="mt-10 border-t border-line pt-8">
        <h2 id="limits" className="font-semibold">
          Limits
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 leading-7">
          <li>I found this by running it. No user has reported it, and I don&apos;t know how often callers reach 11 MiB.</li>
          <li>
            Behaviour change: anyone using the partial output now gets an error. Output just over the cap that used to
            arrive whole is now an error too, as on the no-image path.
          </li>
          <li>
            The real exit code is still lost on this error, and writers can still die from SIGPIPE at the cap. The patch
            reports the problem and does not lift the cap.
          </li>
          <li>
            Side effects still happen before the error comes back: in the first example above, <Mono text="/tmp/done" /> is
            still written. A caller that retries repeats that work.
          </li>
          <li>
            I kept the existing message, which suggests streaming exec, but <Mono text="--stream" /> stops at the same
            size. Pointing at a file may be better.
          </li>
          <li>Tested with the CLI on darwin-arm64 only. I did not run the SDKs, the HTTP API, smol cloud, Linux or Windows.</li>
        </ul>
      </section>

      <footer className="mt-12 border-t border-line pt-5 text-sm text-muted">
        Unofficial demo by Cheryl Aurelia: not affiliated with smol machines
      </footer>
    </main>
  );
}
