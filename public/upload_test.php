<?php

// upload_test.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (empty($_FILES)) {
    // Se a requisição chega, mas o $_FILES está vazio,
    // significa que a requisição POST está falhando no parse (limite ou sintaxe).
    echo "A requisição POST falhou no parsing, o array \$_FILES está vazio. Verifique post_max_size/syntax.";
} else {
    echo "Arquivos recebidos com sucesso!";
    var_dump($_FILES);
}
