<?php

namespace App\Exceptions;

use Exception;

class OrderCannotBeCancelledException extends Exception
{
    public function __construct(string $message = 'Order cannot be cancelled in its current status', int $code = 422, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
