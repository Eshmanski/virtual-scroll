# Основное

В данном проекте можно посмотреть реализацию virtual scroll для большого списка. Компонент VirtualList я писал для решение частной задачи (библиотеки не подходили для решения) по отображению большого количества транспорта с характеристиками (скорость, gps, gsm, уровень топлива и тд). Так как транспорт имел множество полей то его монтирование в дом занимало много времени и в следствии реализовал кастомный скролл с регулируемой скоростью прокрутки для более плавного скроллинга. Все элементы списка группируются по группам и можно раскрывать только одну группу за раз (этакий аккордеон). Также есть реализация Drag&Drop, выбор групп и элементов.

Писал в отдельном проекте данный компонент, так как хотел изолировать его от влияния Quasar и сделать его более менее чистым, хотя дорабатывал я его уже на проекте.

То как он выглядит на проекте:
![VirtualList](https://github.com/Eshmanski/virtual-scroll/blob/master/public/prod.png)

# Запуск

Использовал версию Node основного проекта 18.20
Пакетный менеджер pnpm

1) Скачать пакеты (там только vue)

```bash
    pnpm install
```

2) Запуск

```bash
    pnpm run dev
```
