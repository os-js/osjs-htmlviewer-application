/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

import osjs from 'osjs';
import {name as applicationName} from './metadata.json';

import {
  h,
  app
} from 'hyperapp';

import {
  Box,
  Iframe
} from '@osjs/gui';

const view = (core, proc, win) =>
  (state, actions) => h(Box, {}, [
    h(Iframe, {
      box: {grow: 1},
      src: state.src
    })
  ]);

const openFile = async (core, proc, win, a, file) => {
  const url = await core.make('osjs/vfs').url(file.path);
  const ref = Object.assign({}, file, {url});

  if (file.mime.match(/^text\/html?/)) {
    a.setSource(ref.url);
  }

  win.setTitle(`${proc.metadata.title.en_EN} - ${file.filename}`);
  proc.args.file = file;
};


osjs.register(applicationName, (core, args, options, metadata) => {
  const title = core.make('osjs/locale')
    .translatableFlat(metadata.title);

  const proc = core.make('osjs/application', {
    args,
    options,
    metadata
  });

  proc.createWindow({
    id: 'HTMLViewerWindow',
    title,
    icon: proc.resource(metadata.icon),
    dimension: {width: 400, height: 400}
  })
    .on('destroy', () => proc.destroy())
    .on('render', (win) => win.focus())
    .render(($content, win) => {
      const a = app({
        src: null
      }, {
        setSource: src => state => ({src})
      }, view(core, proc, win), $content);

      if (args.file) {
        openFile(core, proc, win, a, args.file);
      }

      win.on('drop', (ev, data) => {
        if (data.isFile && data.mime) {
          const found = metadata.mimes.find(m => (new RegExp(m)).test(data.mime));
          if (found) {
            openFile(core, proc, win, a, data);
          }
        }
      });
    });

  return proc;
});
