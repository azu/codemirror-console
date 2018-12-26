{% set console = '<a class="gitbook-plugin-js-console" aria-hidden="true"></a>' %}
{% set openConsole = '<a class="gitbook-plugin-js-console open" aria-hidden="true"></a>' %}

{% console %}{% endconsole %}
```js
1 + 2;
```

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

Default: close

<!-- js-console:close -->
```js
1 + 2;
```

Default: open

<!-- js-console:open -->
```js
1 + 2;
```
