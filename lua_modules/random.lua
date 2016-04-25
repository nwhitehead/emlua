-- IMPORTANT: This module requires double precision numbers

-- Random number generator MRG32k3a (32-bit, uniform)
-- From: L'Ecuyer, Good Parameter Sets for Combined Multiple Recursive
--   Random Number Generators, Operations Research, 47, 1 (1999).

local random = {}

local seed
local s10, s11, s12, s20, s21, s22

local norm = 2.328306549295728e-10
local m1 = 4294967087.0
local m2 = 4294944443.0
local a12 = 1403580.0
local a13n = 810728.0
local a21 = 527612.0
local a23n = 1370589.0

function random.seed(s0, s1, s2, s3, s4, s5)
    s10 = (s0 or 1) % 4294944443
    s11 = (s1 or 2) % 4294944443
    s12 = (s2 or 3) % 4294944443
    s20 = (s3 or 4) % 4294944443
    s21 = (s4 or 5) % 4294944443
    s22 = (s5 or 6) % 4294944443
end

function random.state()
    return s10, s11, s12, s20, s21, s22
end

function random.uniform01()
    local p1, p2, k
    -- Generate uniform pseudorandom real in [0, 1)
    
    -- First component
    p1 = a12 * s11 - a13n * s10
    k = math.floor(p1 / m1)
    p1 = p1 - k * m1
    if p1 < 0 then
        p1 = p1 + m1
    end
    s10 = s11
    s11 = s12
    s12 = p1

    -- Second component
    p2 = a21 * s22 - a23n * s20
    k = math.floor(p2 / m2)
    p2 = p2 - k * m2
    if p2 < 0 then
        p2 = p2 + m2
    end
    s20 = s21
    s21 = s22
    s22 = p2
    
    -- Final result
    if p1 <= p2 then
        return ((p1 - p2) + m1) * norm
    end
    return (p1 - p2) * norm
end

-- Return a random real in [0, 1)
function random.random()
    return random.uniform01()
end

-- Return a random real in [u, v)
function random.uniform(u, v)
    local r = random.uniform01()
    if u == nil and v == nil then
        return r
    end
    if v == nil then
        return r * u
    end
    return u + (v - u) * r
end

-- Return a random integer in [a, b]
function random.randint(a, b)
    local r = random.uniform01()
    local possibilities = b - a + 1
    return math.floor(r * possibilities) + a
end

-- Pick random element of array
function random.choice(lst)
    return lst[random.randint(1, #lst)]
end

return random
