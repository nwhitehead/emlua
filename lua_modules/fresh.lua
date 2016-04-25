---- Create fresh ids guaranteed to be globally unique

local gid = 0
local ids = {}
local names = {}

local fresh = {}

---- Return fresh number that hasn't been used yet.
-- If bin name is given then number is unique to bin.
-- If no bin name is given then number is globally unique.
-- @param tag optional bin name
-- @return unused integer
function fresh.id(tag)
    if not tag then
        gid = gid + 1
        return gid
    end
    if not ids[tag] then
        ids[tag] = 0
    end
    local n = ids[tag] + 1
    ids[tag] = n
    if n > gid then
        gid = n
    end
    return n
end

return fresh
