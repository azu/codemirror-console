{% set console = '<a class="gitbook-plugin-js-console" aria-hidden="true"></a>' %}
{% set openConsole = '<a class="gitbook-plugin-js-console open" aria-hidden="true"></a>' %}


`<a class="gitbook-plugin-js-console" aria-hidden="true"></a>`

{{console}}
```js
1 + 2;
```

`<a class="gitbook-plugin-js-console open" aria-hidden="true"></a>`

{{openConsole}}
```js
1 + 2;
```

`<!-- js-console:{ "state": "closed" } -->`

<!-- js-console:{ "state": "closed" } -->
```js
1 + 2;
```

`<!-- js-console:{ "state": "open" }-->`

<!-- js-console:{ "state": "open" } -->
```js
1 + 2;
```

`<!-- js-console:{ "type": "module" }-->`

<!-- js-console:{ "type": "module" } -->
```js
const ret = await 1;
console.log(ret);
```
