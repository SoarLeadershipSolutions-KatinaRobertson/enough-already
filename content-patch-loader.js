(() => {
  'use strict';

  const partFiles = [
    './content-patch/part-01.js.txt',
    './content-patch/part-02.js.txt',
    './content-patch/part-03.js.txt',
    './content-patch/part-04.js.txt',
    './content-patch/part-05.js.txt'
  ];

  async function loadPatch() {
    const responses = await Promise.all(partFiles.map((path) => fetch(new URL(path, document.baseURI), { cache: 'no-cache' })));
    const failed = responses.find((response) => !response.ok);
    if (failed) throw new Error(`Content patch part returned ${failed.status}`);

    const source = (await Promise.all(responses.map((response) => response.text()))).join('');
    const sourceURL = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    const script = document.createElement('script');
    script.src = sourceURL;
    script.dataset.soarContentPatchRuntime = 'true';
    script.onload = () => URL.revokeObjectURL(sourceURL);
    script.onerror = () => {
      URL.revokeObjectURL(sourceURL);
      console.error('[SOAR] The content patch could not be initialized.');
    };
    document.head.appendChild(script);
  }

  loadPatch().catch((error) => console.error('[SOAR] Unable to load the content patch.', error));
})();
