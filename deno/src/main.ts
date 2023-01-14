import { Duration, Effect, pipe, Queue, runMain } from '@/lib';

const main = Effect.gen(function* ($) {
  const queue = yield* $(Queue.unbounded<number>());

  for (let i = 0; i < 3; i++) {
    yield* $(pipe(
      Effect.gen(function* ($) {
        yield* $(Effect.gen(function* ($) {
          while (true) {
            const n = yield* $(Queue.take(queue));
            yield* $(Effect.log(`got: ${n}`));
          }
        }));
      }),
      Effect.onInterrupt(() => Effect.log(`interrupted pull`)),
      Effect.forkScoped,
    ));
  }

  yield* $(pipe(
    Effect.gen(function* ($) {
      let n = 0;
      while (true) {
        yield* $(Effect.sleep(Duration.millis(500)));
        yield* $(Queue.offer(n++)(queue));
      }
    }),
    Effect.onInterrupt(() => Effect.log(`interrupted push`)),
  ));
});

runMain(main);
