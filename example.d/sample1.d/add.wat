(module

  (func $add64f (param $x f64) (param $y f64) (result f64)
    local.get $x
    local.get $y
    f64.add
  )

  (func $mul64f (param $x f64) (param $y f64) (result f64)
    local.get $x
    local.get $y
    f64.mul
  )

  (export "add_double" (func $add64f))
  (export "mul_double" (func $mul64f))

)
