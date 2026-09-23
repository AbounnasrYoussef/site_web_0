-user exist, wrong password
->
0.087630
0.060642
0.061527
0.060984


-user doesn't exist, dummy hash
/goinfre/zguellou/ft_transcendence (main) % for i in $(seq 1 4); do
  curl -s -o /dev/null -w '%{time_total}\n' \
    -X POST http://localhost:5000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"doest@exist.com","password":"definitely-wrong-password-123"}'
done

->
0.070689
0.057030
0.059050
0.058273


-user doesn't exist, dummy hash doesn't exist
/goinfre/zguellou/ft_transcendence (main) % for i in $(seq 1 4); do
  curl -s -o /dev/null -w '%{time_total}\n' \
    -X POST http://localhost:5000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"doest@exist.com","password":"definitely-wrong-password-123"}'
done

->
0.044113
0.005288
0.004204
0.004045