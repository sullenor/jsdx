# JSDX

В качестве файлика с настройками может быть `jsdx.json` файл или CommonJS модуль `jsdx.js`, который возвращает объект. Возможные поля объекта:

* **levels** `array` &mdash; Список уровней с блоками, по которым нужно собрать документацию.
* **output** `string` &mdash; Папка, в которую будут скопированы статические файлики. Работает с опцией `-h, --html`.

Подробнее о всех параметрах:
```
jsdx --help
```
