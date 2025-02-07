def a(v):
	print(v)

variable = True

if variable:
	a("True")
	if variable:
		a("inside")
else:
	a("False")