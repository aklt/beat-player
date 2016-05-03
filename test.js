
ab.ready(function () {
  console.warn('Test')

  var e1 = ab.Elem.create({
    parent: 'test1',
    id: 'keyboard2',
    tpl: ab.templates.keyboard
  })
  e1.render([1,2,3])
  e1.attach()
})
