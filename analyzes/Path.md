# Path
Path is a sort of a [URI](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier) (Uniform Resource Identifier).

A sample URI fragmems from Wikipedia:
<pre>
          userinfo     host        port
          ┌─┴────┐ ┌────┴────────┐ ┌┴┐ 
  https://john.doe@www.example.com:123/forum/questions/?tag=networking&order=newest#top
  └─┬─┘ └───────┬────────────────────┘└─┬─────────────┘└──┬───────────────────────┘└┬─┘  
  scheme     authority                 path              query                      fragment
</pre>
It contains the parts:
- path (must)
- query (optional)
- fragment (optional) _also refered as hash_

The parts before the _URI path_ are not be part the **path**.

Providing an invalid path format while creating the router should cause `Error("Invalid path")`

## Limits of definition
Following examples are valid for defining the paths:
```
resource
resource/path
resource/:pathParam
resource/path/:pathParam
resource/:pathParam/path
resource/:pathParam1/:pathParam2
resource/path1/path2
```

- Cannot have references to to root, starting with slash `/`
- Cannot have references to the parent, starting with or containing dot dot slash `../`
- Cannot have references to the current, starting with or containing dot slash `./`
- Cannot have references to scheme, containing double slashes `//`
- Can define some paths as a path variable, starting with column `:` after path separator slash `/`
    - Otherwise using of column `:` is prohibited
- Cannot contain query `?`, `;`, `&` or hash `#`
- Cannot contain `[`, `]`, `@`, `!`, `$`, `'`, `(`, `)`, `*`, `+`, `,`, `=`
- Ending slashes `/` will be removed

## Limits of Calling
Following examples are valid for calling:
```
/path/resource
path/resource
/path/resource
../resource
./resource
resource
```
In addition to the examples above they may contain _query_ values and a _hash_ value.

- Cannot contain `:`, `[`, `]`, `@`
    - Following characters are to be escaped, using `encodeURIComponent`: `!`, `$`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `;`, `=`
- Cannot have references to scheme, containing double slashes `//`
- Path ending slashes `/` will be ignored

### Resolution
While calling the path, it might be resolved. Current path is this: `a/b/c/d;p?q`
<pre>
"g:h"     -> "g:h"
"g"       -> "a/b/c/g"
"./g"     -> "a/b/c/g"
"g/"      -> "a/b/c/g/"
"/g"      -> "a/g"
"?y"      -> "a/b/c/d;p?y"
"g?y"     -> "a/b/c/g?y"
"#s"      -> "a/b/c/d;p?q#s"
"g#s"     -> "a/b/c/g#s"
"g?y#s"   -> "a/b/c/g?y#s"
";x"      -> "a/b/c/;x"
"g;x"     -> "a/b/c/g;x"
"g;x?y#s" -> "a/b/c/g;x?y#s"
""        -> "a/b/c/d;p?q"
"."       -> "a/b/c/"
"./"      -> "a/b/c/"
".."      -> "a/b/"
"../"     -> "a/b/"
"../g"    -> "a/b/g"
"../.."   -> "a/"
"../../"  -> "a/"
"../../g" -> "a/g"
</pre>

# Parameters
<pre>
        path parameter   name      value    name  value
            ┌───┴─────┐┌───┴───┐ ┌────┴───┐ ┌─┴─┐ ┌──┴─┐ 
  /products/:productId/?category=networking&order=newest#top
  └─┬─────────────────┘└──┬────────────────────────────┘└┬─┘  
   path                  query                          fragment
</pre>
## Path Parameter

Path parameters are part of the _URI path_, defined with starting colum `:`. Rest or the path segment is the name of the path. So path is defined with `products` and followed by `productId` path variable.

## Query Parameter
It has two query paremeters:
- First one is named `category` value of it is `networking`
- Second one is named `order` value of it is `newest`

## Hash Parameter
We can determine it has a hash parameter or not. Yes, this one has it and its value is `top`