# Примеры

## Форма записи необязательного параметра

```
/**
 * @param {string} [somebody] - Somebody's name.
 */
function sayHello(somebody) {
    if (!somebody) {
        somebody = 'John Doe';
    }
    alert('Hello ' + somebody);
}
```

## Аргумент может иметь разные типы (объединение типов)

```
/**
 * @param {(string|string[])} [somebody=John Doe] - Somebody's name, or an array of names.
 */
function sayHello(somebody) {
    if (!somebody) {
        somebody = 'John Doe';
    } else if (Array.isArray(somebody)) {
        somebody = somebody.join(', ');
    }
    alert('Hello ' + somebody);
}
```

## Любой тип аргумента

```
/**
 * @param {*} somebody - Whatever you want.
 */
function sayHello(somebody) {
    console.log('Hello ' + JSON.stringify(somebody));
}
```

## Повторение аргумента (можно передать несколько аргументов)

```
/**
 * Returns the sum of all numbers passed to the function.
 * @param {...number} num - A positive or negative number.
 */
function sum(num) {
    var i = 0, n = arguments.length, t = 0;
    for (; i < n; i++) {
        t += arguments[i];
    }
    return t;
}
```

Оригинал: [@param](http://usejsdoc.org/tags-param.html)
