#!/bin/bash

FILE="doc/8-execution-plan.md"

# BE-008: 요청 검증 미들웨어
sed -i '413s/\[ \]/[x]/' "$FILE"
sed -i '414s/\[ \]/[x]/' "$FILE"
sed -i '415s/\[ \]/[x]/' "$FILE"
sed -i '416s/\[ \]/[x]/' "$FILE"
sed -i '417s/\[ \]/[x]/' "$FILE"

# BE-009: CORS 및 Rate Limiting
sed -i '427s/\[ \]/[x]/' "$FILE"
sed -i '428s/\[ \]/[x]/' "$FILE"
sed -i '429s/\[ \]/[x]/' "$FILE"
sed -i '430s/\[ \]/[x]/' "$FILE"
sed -i '431s/\[ \]/[x]/' "$FILE"

# BE-010: User Repository
sed -i '443s/\[ \]/[x]/' "$FILE"
sed -i '444s/\[ \]/[x]/' "$FILE"
sed -i '445s/\[ \]/[x]/' "$FILE"
sed -i '446s/\[ \]/[x]/' "$FILE"
sed -i '447s/\[ \]/[x]/' "$FILE"

# BE-011: Todo Repository
sed -i '455s/\[ \]/[x]/' "$FILE"
sed -i '456s/\[ \]/[x]/' "$FILE"
sed -i '457s/\[ \]/[x]/' "$FILE"
sed -i '458s/\[ \]/[x]/' "$FILE"
sed -i '459s/\[ \]/[x]/' "$FILE"

# BE-012: Holiday Repository
sed -i '467s/\[ \]/[x]/' "$FILE"
sed -i '468s/\[ \]/[x]/' "$FILE"
sed -i '469s/\[ \]/[x]/' "$FILE"
sed -i '470s/\[ \]/[x]/' "$FILE"

# BE-013: Auth Service
sed -i '482s/\[ \]/[x]/' "$FILE"
sed -i '483s/\[ \]/[x]/' "$FILE"
sed -i '484s/\[ \]/[x]/' "$FILE"
sed -i '485s/\[ \]/[x]/' "$FILE"
sed -i '486s/\[ \]/[x]/' "$FILE"

# BE-014: Todo Service
sed -i '494s/\[ \]/[x]/' "$FILE"
sed -i '495s/\[ \]/[x]/' "$FILE"
sed -i '496s/\[ \]/[x]/' "$FILE"
sed -i '497s/\[ \]/[x]/' "$FILE"
sed -i '498s/\[ \]/[x]/' "$FILE"

# BE-015: Holiday Service
sed -i '506s/\[ \]/[x]/' "$FILE"
sed -i '507s/\[ \]/[x]/' "$FILE"
sed -i '508s/\[ \]/[x]/' "$FILE"
sed -i '509s/\[ \]/[x]/' "$FILE"
sed -i '510s/\[ \]/[x]/' "$FILE"

# BE-016: User Service
sed -i '518s/\[ \]/[x]/' "$FILE"
sed -i '519s/\[ \]/[x]/' "$FILE"
sed -i '520s/\[ \]/[x]/' "$FILE"
sed -i '521s/\[ \]/[x]/' "$FILE"

# BE-017: Auth Controller
sed -i '533s/\[ \]/[x]/' "$FILE"
sed -i '534s/\[ \]/[x]/' "$FILE"
sed -i '535s/\[ \]/[x]/' "$FILE"
sed -i '536s/\[ \]/[x]/' "$FILE"
sed -i '537s/\[ \]/[x]/' "$FILE"

# BE-018: Todo Controller
sed -i '545s/\[ \]/[x]/' "$FILE"
sed -i '546s/\[ \]/[x]/' "$FILE"
sed -i '547s/\[ \]/[x]/' "$FILE"
sed -i '548s/\[ \]/[x]/' "$FILE"
sed -i '549s/\[ \]/[x]/' "$FILE"

# BE-019: Holiday Controller
sed -i '557s/\[ \]/[x]/' "$FILE"
sed -i '558s/\[ \]/[x]/' "$FILE"
sed -i '559s/\[ \]/[x]/' "$FILE"
sed -i '560s/\[ \]/[x]/' "$FILE"

# BE-020: User Controller
sed -i '568s/\[ \]/[x]/' "$FILE"
sed -i '569s/\[ \]/[x]/' "$FILE"
sed -i '570s/\[ \]/[x]/' "$FILE"

# BE-021: AsyncHandler
sed -i '578s/\[ \]/[x]/' "$FILE"
sed -i '579s/\[ \]/[x]/' "$FILE"
sed -i '580s/\[ \]/[x]/' "$FILE"

# BE-022: Auth Routes
sed -i '592s/\[ \]/[x]/' "$FILE"
sed -i '593s/\[ \]/[x]/' "$FILE"
sed -i '594s/\[ \]/[x]/' "$FILE"

# BE-023: Todo Routes
sed -i '602s/\[ \]/[x]/' "$FILE"
sed -i '603s/\[ \]/[x]/' "$FILE"
sed -i '604s/\[ \]/[x]/' "$FILE"
sed -i '605s/\[ \]/[x]/' "$FILE"

# BE-024: Holiday Routes
sed -i '613s/\[ \]/[x]/' "$FILE"
sed -i '614s/\[ \]/[x]/' "$FILE"
sed -i '615s/\[ \]/[x]/' "$FILE"

# BE-025: User Routes
sed -i '623s/\[ \]/[x]/' "$FILE"
sed -i '624s/\[ \]/[x]/' "$FILE"
sed -i '625s/\[ \]/[x]/' "$FILE"

# BE-027: 라우트 통합
sed -i '642s/\[ \]/[x]/' "$FILE"
sed -i '643s/\[ \]/[x]/' "$FILE"
sed -i '644s/\[ \]/[x]/' "$FILE"
sed -i '645s/\[ \]/[x]/' "$FILE"

# BE-028: API 테스트
sed -i '657s/\[ \]/[x]/' "$FILE"
sed -i '658s/\[ \]/[x]/' "$FILE"
sed -i '659s/\[ \]/[x]/' "$FILE"
sed -i '660s/\[ \]/[x]/' "$FILE"
sed -i '661s/\[ \]/[x]/' "$FILE"

echo "체크리스트 업데이트 완료"
