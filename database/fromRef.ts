/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ListenEvent, QueryChange, ListenerMethods } from './interfaces';
import { off } from 'firebase/database';

/**
 * Create an observable from a Database Reference or Database Query.
 * @param ref Database Reference
 * @param event Listen event type ('value', 'added', 'changed', 'removed', 'moved')
 */
export function fromRef(
  ref: import('firebase/database').Query,
  event: ListenEvent
): Observable<QueryChange> {
  return new Observable<QueryChange>(subscriber => {
    const fn = ListenerMethods[event](
      ref,
      (snapshot, prevKey) => {
        subscriber.next({ snapshot, prevKey, event });
      },
      subscriber.error.bind(subscriber)
    );
    return {
      unsubscribe() {
        off(ref, event, fn);
      }
    };
  }).pipe(
    // Ensures subscribe on observable is async. This handles
    // a quirk in the SDK where on/once callbacks can happen
    // synchronously.
    delay(0)
  );
}
